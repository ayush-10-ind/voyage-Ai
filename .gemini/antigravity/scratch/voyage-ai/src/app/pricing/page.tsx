"use client";

import React from "react";
import Link from "next/link";
import { useUserContext } from "@/features/auth/context/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function PricingPage() {
  const { authenticated, user } = useUserContext();

  const plans = [
    {
      name: "Explorer",
      price: "$0",
      period: "forever",
      description: "Perfect for planning individual trips and exploring the spatial map.",
      features: ["Up to 3 active itineraries", "Standard AI Copilot onboarding", "Interactive 3D Landing Globe", "Basic budget & finance tracking"],
      cta: "Get Started",
      primary: false
    },
    {
      name: "Voyager Pro",
      price: "$12",
      period: "per month",
      description: "Unlock advanced reasoning, unlimited trips, and collaborative planning.",
      features: ["Unlimited active itineraries", "Priority AI Copilot with advanced context", "Real-world Mapbox / OpenWeather API integrations", "Detailed financial ledger & exports", "Premium spatial travel stats"],
      cta: "Start Free Trial",
      primary: true
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
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/pricing" className="text-white">Pricing</Link>
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
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center gap-8 z-10 text-center relative">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold tracking-widest text-primary">Simple, Transparent Pricing</p>
          <Typography variant="display" className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">
            Plans for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Every Explorer</span>
          </Typography>
        </div>

        <Typography variant="body" className="text-muted-foreground text-base leading-relaxed max-w-xl mx-auto">
          Choose the plan that fits your travel style. Upgrade or downgrade at any time.
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-6 max-w-4xl">
          {plans.map((plan, idx) => (
            <GlassCard
              key={idx}
              padding="lg"
              className={`border-glow text-left flex flex-col justify-between h-full relative ${
                plan.primary ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20 scale-[1.02]" : "bg-white/5"
              }`}
            >
              {plan.primary && (
                <span className="absolute -top-2.5 right-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full glow-primary">
                  Popular
                </span>
              )}
              <div className="space-y-4">
                <div>
                  <Typography variant="body" className="font-bold text-white text-lg">{plan.name}</Typography>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/ {plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground border-t border-white/5 pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Icons.explore className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/sign-up" className="w-full mt-8">
                <Button
                  className={`w-full h-11 font-bold rounded-xl ${
                    plan.primary
                      ? "bg-primary hover:bg-primary/90 text-white glow-primary"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}
