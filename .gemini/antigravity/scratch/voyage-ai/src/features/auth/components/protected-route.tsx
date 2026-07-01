"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserContext } from "../context/user-context";
import { VoyageLogger } from "@/lib/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authenticated, loading } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        VoyageLogger.info("Auth", `Protected Route Access Blocked: Redirecting from ${pathname} to /sign-in`);
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      } else {
        VoyageLogger.info("Auth", `Protected Route Access Allowed: ${pathname}`);
      }
    }
  }, [authenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#070b19] flex flex-col items-center justify-center gap-4 z-50">
        {/* Animated premium glassmorphic loader */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Securing Session...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
