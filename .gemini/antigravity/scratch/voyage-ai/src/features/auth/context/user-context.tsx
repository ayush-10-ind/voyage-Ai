"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContextType, User } from "../types";
import { VoyageLogger } from "@/lib/logger";
import { ProfileDBService } from "@/services/db/profile-db-service";
import { MemoryDBService } from "@/services/db/memory-db-service";
import { TripDBService } from "@/services/db/trip-db-service";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { supabase } from "@/lib/supabase";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const IS_CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let ClerkProvider: any = null;
let ClerkUserProviderInternal: any = null;

if (IS_CLERK_CONFIGURED) {
  try {
    const clerkNext = require("@clerk/nextjs");
    ClerkProvider = clerkNext.ClerkProvider;
  } catch (e) {}
}

interface MockAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  country?: string;
}

function UnifiedUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize workspace upon login
  const restoreWorkspace = async (userId: string, email: string, name: string, phone?: string, country?: string) => {
    try {
      VoyageLogger.info("Auth", `Preloading user workspace for: ${email}`);
      
      // 1. Restore Profile & Preferences
      const profile = await ProfileDBService.syncProfile(userId, {
        fullName: name || "Explorer",
        email: email || "",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "Explorer")}`
      });

      const finalUser: User = {
        id: userId,
        name: profile.fullName || name,
        email: profile.email || email,
        image: profile.avatar,
        phone,
        country
      };

      setUser(finalUser);
      localStorage.setItem("voyage_user", JSON.stringify(finalUser));

      // 2. Preload AI Memory & Search History
      await MemoryDBService.fetchAIMemory(userId);
      await MemoryDBService.fetchSearchHistory(userId);

      // 3. Load active trip if cached in LocalStorage
      const activeTripId = localStorage.getItem("voyage_active_trip_id");
      if (activeTripId) {
        const userTrips = await TripDBService.fetchUserTrips(userId);
        const activeTrip = userTrips.find(t => t.id === activeTripId);
        if (activeTrip) {
          useTimelineStore.getState().loadTripFromDB(activeTrip);
          useCopilotStore.getState().loadFromSavedTrip(activeTrip);
        }
      }
    } catch (err) {
      VoyageLogger.error("Auth", "Failed to fully preload user workspace assets.");
    }
  };

  // Restores session on mount
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      
      if (supabase) {
        // Supabase Auth Session restore
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            const meta = session.user.user_metadata || {};
            await restoreWorkspace(
              session.user.id,
              session.user.email || "",
              meta.fullName || meta.name || "Explorer",
              meta.phone,
              meta.country
            );
          }
          
          // Listen for session updates
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
              const meta = session.user.user_metadata || {};
              await restoreWorkspace(
                session.user.id,
                session.user.email || "",
                meta.fullName || meta.name || "Explorer",
                meta.phone,
                meta.country
              );
            } else if (event === "SIGNED_OUT") {
              setUser(null);
            }
          });

          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (e) {
          VoyageLogger.error("Auth", "Supabase session query exception, falling back to local.");
        }
      }

      // Local storage mock fallback
      const stored = localStorage.getItem("voyage_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch (e) {
          localStorage.removeItem("voyage_user");
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const getRegistry = (): MockAccount[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("voyage_mock_auth_registry") || "[]");
    } catch (e) {
      return [];
    }
  };

  const login = async (email: string, password?: string, isOAuth?: boolean): Promise<boolean> => {
    setLoading(true);
    await sleep(600);

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || ""
        });

        if (error) throw error;
        if (data && data.user) {
          const meta = data.user.user_metadata || {};
          await restoreWorkspace(
            data.user.id,
            data.user.email || "",
            meta.fullName || meta.name || "Explorer",
            meta.phone,
            meta.country
          );
          setLoading(false);
          return true;
        }
      } catch (err: any) {
        setLoading(false);
        throw new Error(err.message || "Failed to authenticate with Supabase.");
      }
    }

    // Fallback credentials registry
    const registry = getRegistry();
    const found = registry.find((acc) => acc.email.toLowerCase() === email.toLowerCase());

    if (!found || found.passwordHash !== password) {
      setLoading(false);
      throw new Error("Invalid email or password.");
    }

    const mockUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(found.name)}`,
      phone: found.phone,
      country: found.country
    };

    await restoreWorkspace(mockUser.id, mockUser.email || "", mockUser.name || "Explorer", mockUser.phone, mockUser.country);
    setLoading(false);
    return true;
  };

  const signUp = async (
    email: string,
    name: string,
    password: string,
    phone?: string,
    country?: string
  ): Promise<boolean> => {
    setLoading(true);
    await sleep(600);

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName: name,
              phone,
              country
            }
          }
        });

        if (error) throw error;
        if (data && data.user) {
          await restoreWorkspace(data.user.id, email, name, phone, country);
          setLoading(false);
          return true;
        }
      } catch (err: any) {
        setLoading(false);
        throw new Error(err.message || "Failed to register account in Supabase.");
      }
    }

    const registry = getRegistry();
    const exists = registry.some((acc) => acc.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      setLoading(false);
      throw new Error("An account with this email already exists.");
    }

    const newAccount: MockAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      passwordHash: password,
      phone,
      country
    };

    registry.push(newAccount);
    localStorage.setItem("voyage_mock_auth_registry", JSON.stringify(registry));

    await restoreWorkspace(newAccount.id, newAccount.email, newAccount.name, newAccount.phone, newAccount.country);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    await sleep(300);

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }

    setUser(null);
    localStorage.removeItem("voyage_user");
    localStorage.removeItem("voyage_active_trip_id");
    
    setLoading(false);
    useTimelineStore.getState().clearTrip();
    useCopilotStore.getState().resetCopilot();
  };

  const openSignIn = () => {
    window.location.href = "/sign-in";
  };

  const openSignUp = () => {
    window.location.href = "/sign-up";
  };

  const value: UserContextType = {
    userId: user?.id || null,
    user,
    authenticated: !!user,
    loading,
    login,
    signUp,
    logout,
    openSignIn,
    openSignUp,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  if (IS_CLERK_CONFIGURED && ClerkProvider) {
    return (
      <ClerkProvider>
        <UnifiedUserProvider>{children}</UnifiedUserProvider>
      </ClerkProvider>
    );
  }

  return <UnifiedUserProvider>{children}</UnifiedUserProvider>;
}
