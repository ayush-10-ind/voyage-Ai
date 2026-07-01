"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useUserContext } from "@/features/auth/context/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useUserContext();

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] text-white flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-black text-lg tracking-tight hover:opacity-80 transition-opacity">
          <Icons.explore className="h-5 w-5 text-primary" />
          Voyage AI
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold hover:bg-white/5">
            <Icons.chevronLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12 flex flex-col justify-start items-start gap-8 z-10 text-left relative">
        <div className="space-y-2">
          <Typography variant="title" className="text-3xl font-black font-heading tracking-tight">
            User Profile
          </Typography>
          <p className="text-sm text-muted-foreground">
            Your personal traveler identity.
          </p>
        </div>

        <GlassCard padding="lg" className="border-glow bg-white/5 w-full flex flex-col items-center text-center gap-4 py-10">
          <img
            src={user?.image || ""}
            alt={user?.name || "Avatar"}
            className="h-20 w-20 rounded-full border-2 border-primary glow-primary"
          />
          <div className="space-y-1">
            <Typography variant="body" className="font-bold text-white text-lg">
              {user?.name || "Explorer"}
            </Typography>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 border-t border-white/5 pt-6 text-xs text-muted-foreground">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] uppercase font-bold text-primary">Member Since</p>
              <p className="font-bold text-white">June 2026</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] uppercase font-bold text-secondary">User Level</p>
              <p className="font-bold text-white">Global Voyager</p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
