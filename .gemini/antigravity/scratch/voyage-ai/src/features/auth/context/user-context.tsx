"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContextType, User } from "../types";
import { VoyageLogger } from "@/lib/logger";
import { ProfileDBService } from "@/services/db/profile-db-service";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";

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
let useClerkUser: any = null;
let useClerkAuth: any = null;
let useClerk: any = null;

if (IS_CLERK_CONFIGURED) {
  try {
    const clerkNext = require("@clerk/nextjs");
    ClerkProvider = clerkNext.ClerkProvider;
    useClerkUser = clerkNext.useUser;
    useClerkAuth = clerkNext.useAuth;
    useClerk = clerkNext.useClerk;
  } catch (e) {
    console.error("Failed to load Clerk packages", e);
  }
}

function ClerkUserProviderInternal({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkUser();
  const { userId, signOut } = useClerkAuth();
  const { openSignIn, openSignUp } = useClerk();

  const [syncedUser, setSyncedUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);

  const getName = (cu: any) => {
    if (cu.fullName) return cu.fullName;
    if (cu.firstName) {
      if (cu.lastName) return `${cu.firstName} ${cu.lastName}`;
      return cu.firstName;
    }
    if (cu.primaryEmailAddress?.emailAddress) {
      const username = cu.primaryEmailAddress.emailAddress.split("@")[0];
      return username
        .split(/[\._-]/)
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
    }
    return "Explorer";
  };

  const initialUser: User | null = clerkUser ? {
    id: clerkUser.id,
    name: getName(clerkUser),
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    image: clerkUser.imageUrl,
  } : null;

  useEffect(() => {
    if (initialUser) {
      setSyncing(true);
      ProfileDBService.syncProfile(initialUser.id, {
        fullName: initialUser.name || "Explorer",
        email: initialUser.email || "",
        avatar: initialUser.image || ""
      })
      .then((profile) => {
        setSyncedUser({
          id: initialUser.id,
          name: profile.fullName || initialUser.name,
          email: profile.email || initialUser.email,
          image: profile.avatar || initialUser.image
        });
      })
      .catch((err) => {
        VoyageLogger.error("Auth", "Failed to sync Clerk profile to database");
        setSyncedUser(initialUser);
      })
      .finally(() => {
        setSyncing(false);
      });
    } else {
      setSyncedUser(null);
    }
  }, [clerkUser]);

  const value: UserContextType = {
    userId: userId || null,
    user: syncedUser,
    authenticated: !!userId,
    loading: !isUserLoaded || syncing,
    login: async () => true,
    signUp: async () => true,
    logout: async () => {
      VoyageLogger.info("Auth", "User Signed Out (via Clerk)");
      await signOut();
      useTimelineStore.getState().clearTrip();
      useCopilotStore.getState().resetCopilot();
    },
    openSignIn: () => openSignIn(),
    openSignUp: () => openSignUp(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Local mock database model interface
interface MockAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored in plain text for development sandbox ease
  phone?: string;
  country?: string;
}

function MockUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("voyage_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        ProfileDBService.syncProfile(parsed.id, {
          fullName: parsed.name || "Explorer",
          email: parsed.email || "",
          avatar: parsed.image || ""
        }).catch((err) => VoyageLogger.error("Auth", "Mock user initial sync failed"));
      } catch (e) {
        localStorage.removeItem("voyage_user");
      }
    }
    setLoading(false);
  }, []);

  const getRegistry = (): MockAccount[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("voyage_mock_auth_registry") || "[]");
    } catch (e) {
      return [];
    }
  };

  const saveRegistry = (registry: MockAccount[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("voyage_mock_auth_registry", JSON.stringify(registry));
  };

  const login = async (email: string, password?: string, isOAuth?: boolean): Promise<boolean> => {
    setLoading(true);
    await sleep(600);
    
    if (isOAuth) {
      // Social OAuth mock trigger
      const oauthName = email.split("@")[0]
        .split(/[\._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      const mockUser: User = {
        id: `oauth-user-${Date.now()}`,
        name: oauthName,
        email: email,
        image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(oauthName)}`,
      };

      const profile = await ProfileDBService.syncProfile(mockUser.id, {
        fullName: mockUser.name || "Explorer",
        email: mockUser.email || "",
        avatar: mockUser.image || ""
      });

      const finalUser = {
        id: mockUser.id,
        name: profile.fullName || mockUser.name,
        email: profile.email || mockUser.email,
        image: profile.avatar || mockUser.image
      };

      setUser(finalUser);
      localStorage.setItem("voyage_user", JSON.stringify(finalUser));
      setLoading(false);
      VoyageLogger.info("Auth", `User Signed In (OAuth): ${email}`);
      return true;
    }

    // Credentials lookup
    const registry = getRegistry();
    const found = registry.find((acc) => acc.email.toLowerCase() === email.toLowerCase());

    if (!found || found.passwordHash !== password) {
      setLoading(false);
      VoyageLogger.warn("Auth", `Failed credentials login attempt for: ${email}`);
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

    const profile = await ProfileDBService.syncProfile(mockUser.id, {
      fullName: mockUser.name || "Explorer",
      email: mockUser.email || "",
      avatar: mockUser.image || ""
    });

    const finalUser = {
      id: mockUser.id,
      name: profile.fullName || mockUser.name,
      email: profile.email || mockUser.email,
      image: profile.avatar || mockUser.image,
      phone: mockUser.phone,
      country: mockUser.country
    };

    setUser(finalUser);
    localStorage.setItem("voyage_user", JSON.stringify(finalUser));
    setLoading(false);
    VoyageLogger.info("Auth", `User Signed In (Credentials): ${email}`);
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

    const registry = getRegistry();
    const exists = registry.some((acc) => acc.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      setLoading(false);
      VoyageLogger.warn("Auth", `Register attempt failed: email already exists: ${email}`);
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
    saveRegistry(registry);

    // Auto-login upon registration
    const mockUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newAccount.name)}`,
      phone: newAccount.phone,
      country: newAccount.country
    };

    const profile = await ProfileDBService.syncProfile(mockUser.id, {
      fullName: mockUser.name || "Explorer",
      email: mockUser.email || "",
      avatar: mockUser.image || ""
    });

    const finalUser = {
      id: mockUser.id,
      name: profile.fullName || mockUser.name,
      email: profile.email || mockUser.email,
      image: profile.avatar || mockUser.image,
      phone: mockUser.phone,
      country: mockUser.country
    };

    setUser(finalUser);
    localStorage.setItem("voyage_user", JSON.stringify(finalUser));
    setLoading(false);
    VoyageLogger.info("Auth", `Registered and logged in user: ${email}`);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    await sleep(300);
    const email = user?.email;
    setUser(null);
    localStorage.removeItem("voyage_user");
    setLoading(false);
    VoyageLogger.info("Auth", `User Signed Out: ${email || "unknown"}`);
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
        <ClerkUserProviderInternal>{children}</ClerkUserProviderInternal>
      </ClerkProvider>
    );
  }

  return <MockUserProvider>{children}</MockUserProvider>;
}
