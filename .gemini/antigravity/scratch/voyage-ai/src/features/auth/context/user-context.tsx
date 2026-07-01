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

// Simple check to see if Clerk is configured via environment variables
const IS_CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// 1. Clerk-backed Provider (Only evaluated/imported if Clerk is used)
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
      // Extract username from email
      const username = cu.primaryEmailAddress.emailAddress.split("@")[0];
      // Capitalize first letter of each part if it has dots/dashes
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

// 2. Local Mock Provider (Used by default for offline/sandbox mode)
function MockUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("voyage_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Trigger profile sync in background
        ProfileDBService.syncProfile(parsed.id, {
          fullName: parsed.name || "Explorer",
          email: parsed.email || "",
          avatar: parsed.image || ""
        }).catch((err) => VoyageLogger.error("Auth", "Mock user initial sync failed"));
        VoyageLogger.info("Auth", `Session Restored: ${parsed.email}`);
      } catch (e) {
        localStorage.removeItem("voyage_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, name: string): Promise<boolean> => {
    setLoading(true);
    await sleep(600);
    const mockUser: User = {
      id: `mock-user-${Date.now()}`,
      name,
      email,
      image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`,
    };
    
    // Sync profile to database
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
    VoyageLogger.info("Auth", `User Signed In: ${email}`);
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
    logout,
    openSignIn,
    openSignUp,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 3. Main Exported Provider
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
