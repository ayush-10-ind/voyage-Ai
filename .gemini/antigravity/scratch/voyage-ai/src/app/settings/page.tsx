"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useUserContext } from "@/features/auth/context/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
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
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-start items-start gap-8 z-10 text-left relative">
        <div className="space-y-2">
          <Typography variant="title" className="text-3xl font-black font-heading tracking-tight">
            Account Settings
          </Typography>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences and integrations.
          </p>
        </div>

        <GlassCard padding="lg" className="border-glow bg-white/5 w-full space-y-6">
          {/* User Profile Info */}
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <img
              src={user?.image || ""}
              alt={user?.name || "Avatar"}
              className="h-12 w-12 rounded-full border border-white/10"
            />
            <div>
              <Typography variant="body" className="font-bold text-white text-base">
                {user?.name || "Explorer"}
              </Typography>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Dummy Settings List */}
          <div className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>Email Notifications</span>
              <span className="font-bold text-primary cursor-pointer">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>Spatial Map Provider</span>
              <span className="font-bold text-white">MockMapPro (Vector)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>Measurement Units</span>
              <span className="font-bold text-white">Metric (km, °C)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Security Key</span>
              <span className="font-bold text-muted-foreground">••••••••••••</span>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
