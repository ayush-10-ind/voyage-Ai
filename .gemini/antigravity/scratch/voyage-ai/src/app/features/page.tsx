"use client";

import React from "react";
import Link from "next/link";
import { useUserContext } from "@/features/auth/context/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function FeaturesPage() {
  const { authenticated, user } = useUserContext();

  const features = [
    {
      icon: <Icons.calendar className="h-4 w-4" />,
      title: "Dynamic Timeline",
      description: "Organize activities, drag and drop to reorder, and edit details on the fly. The timeline updates in real-time."
    },
    {
      icon: <Icons.budget className="h-4 w-4" />,
      title: "Finance Engine",
      description: "Set total budgets, track actual spending, and analyze daily pacing. All metrics recalculate instantly as changes occur."
    },
    {
      icon: <Icons.explore className="h-4 w-4" />,
      title: "Spatial Intelligence",
      description: "Visualizes your entire route. Computes scenic scores, carbon footprints, and local coordinates dynamically."
    },
    {
      icon: <Icons.weatherSun className="h-4 w-4 text-amber-400" />,
      title: "Weather Telemetry",
      description: "Fetches live forecast badges for every day of your trip based on exact coordinate data."
    }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] text-white flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20">
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight hover:opacity-80 transition-opacity">
          <Icons.explore className="h-5 w-5 text-primary" />
          Voyage AI
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <Link href="/features" className="text-white">Features</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold glass">
                  Dashboard
                </Button>
              </Link>
              <img
                src={user?.image || ""}
                alt={user?.name || "Avatar"}
                className="h-8 w-8 rounded-full border border-white/10"
              />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white glow-primary">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-start gap-8 z-10 text-left relative">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold tracking-widest text-primary">Core Modules</p>
          <Typography variant="display" className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">
            Designed for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Seamless Travel</span>
          </Typography>
        </div>

        <Typography variant="body" className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          We've engineered four integrated engines to make your travel planning experience intuitive, precise, and beautiful.
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
          {features.map((feat, idx) => (
            <GlassCard key={idx} padding="md" className="border-glow bg-white/5 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                {feat.icon}
              </div>
              <Typography variant="body" className="font-bold text-white text-sm">{feat.title}</Typography>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </GlassCard>
          ))}
        </div>

        <Link href="/sign-up" className="mt-4">
          <Button size="lg" className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white glow-primary px-8 py-6">
            Unlock Full Workspace
          </Button>
        </Link>
      </main>
    </div>
  );
}
