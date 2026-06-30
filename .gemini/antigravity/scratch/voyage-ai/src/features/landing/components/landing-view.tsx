"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SceneCanvas } from "@/three/core/scene-canvas";
import { InteractiveEarth } from "@/features/earth/components/interactive-earth";
import { Typography } from "@/components/ui/typography";
import { SearchBar } from "@/components/ui/search";
import { Chip } from "@/components/ui/misc-primitives";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons } from "@/components/ui/icons";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";

interface LandingViewProps {
  onStartPlanning: (destination?: string) => void;
}

export function LandingView({ onStartPlanning }: LandingViewProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const trip = useTimelineStore((state) => state.trip);
  const { itinerary } = useCopilotStore();

  // Dynamic values
  const destinationName = trip?.destination || "Swiss Alps";
  const totalBudget = trip?.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : (itinerary?.budget?.total || "$2,400");
  const hotelSelected = itinerary?.hotels?.[0]?.name || "Aman Tokyo";

  const getAirportCode = (dest: string) => {
    if (dest.toLowerCase().includes("tokyo")) return "HND";
    if (dest.toLowerCase().includes("paris")) return "CDG";
    if (dest.toLowerCase().includes("zermatt")) return "ZRH";
    if (dest.toLowerCase().includes("reykjavik")) return "KEF";
    if (dest.toLowerCase().includes("ubud") || dest.toLowerCase().includes("bali")) return "DPS";
    if (dest.toLowerCase().includes("tromso")) return "TOS";
    return dest.substring(0, 3).toUpperCase();
  };

  const flightText = trip ? `${getAirportCode(trip.destination)} ➔ JFK • On Time` : "HND ➔ JFK • On Time";

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax to make it feel fluid and expensive
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientWidth, clientHeight } = document.documentElement;
      // Map mouse position to -15px to 15px offset
      const x = (e.clientX / clientWidth - 0.5) * 20;
      const y = (e.clientY / clientHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* 1. Immersive 3D Viewport */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <SceneCanvas performance="high">
          <InteractiveEarth onIntroComplete={() => setShowOverlay(true)} />
        </SceneCanvas>
      </div>

      {/* 2. Interactive HTML Overlay */}
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ x: springX, y: springY }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-12"
        >
          {/* Top Bar / Logo */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icons.explore className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-heading text-lg font-bold tracking-wider uppercase text-gradient">
                Voyage AI
              </span>
            </div>
          </div>

          {/* Central Cinematic Content */}
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full gap-8">
            {/* Headline and Subheading */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography variant="display" className="text-4xl sm:text-6xl font-bold tracking-tight text-gradient">
                  Where will your next journey begin?
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography variant="subtitle" className="text-muted-foreground max-w-md mx-auto">
                  Plan intelligent trips powered by AI.
                </Typography>
              </motion.div>
            </div>

            {/* Animated Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-md flex justify-center"
            >
              <SearchBar onClick={() => onStartPlanning()} className="w-full shadow-glass" />
            </motion.div>

            {/* Popular Destinations Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pointer-events-auto flex flex-wrap justify-center gap-2"
            >
              {["Japan", "Switzerland", "Iceland", "Bali", "Norway"].map((dest, idx) => (
                <motion.div
                  key={dest}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + idx * 0.1, ease: "easeOut" }}
                >
                  <Chip onClick={() => onStartPlanning(dest)} interactive variant="default" className="glass-hover">
                    <Icons.destination className="h-3 w-3 text-primary/80" />
                    <span>{dest}</span>
                  </Chip>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-4"
            >
              <Button onClick={() => onStartPlanning()} size="lg" className="rounded-full font-semibold glow-primary shadow-lg transition-transform hover:scale-105">
                Start Planning
              </Button>
              <Button onClick={() => onStartPlanning()} variant="outline" size="lg" className="rounded-full font-semibold glass hover:bg-white/10 transition-transform hover:scale-105">
                Explore Globe
              </Button>
            </motion.div>
          </div>

          {/* Footer branding */}
          <div className="w-full text-center text-xs text-muted-foreground/60">
            © 2026 Voyage AI. Engineered for premium travel.
          </div>
        </motion.div>
      )}

      {/* 3. Floating Glass Cards (Orbiting the Earth in UI space) */}
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Card 1: Flights (Top Left) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
            transition={{
              x: { duration: 1.2, delay: 0.5 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-1/4 left-8 sm:left-16"
          >
            <GlassCard padding="sm" className="w-48 shadow-glass glass-hover pointer-events-auto flex items-center gap-3">
              <Icons.flight className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Flights</p>
                <p className="text-xs font-bold">{flightText}</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2: Hotels (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
            transition={{
              x: { duration: 1.2, delay: 0.7 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-1/4 left-8 sm:left-24"
          >
            <GlassCard padding="sm" className="w-48 shadow-glass glass-hover pointer-events-auto flex items-center gap-3">
              <Icons.hotel className="h-5 w-5 text-secondary" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Hotels</p>
                <p className="text-xs font-bold">{hotelSelected} • 5★</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 3: Weather (Top Right) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
            transition={{
              x: { duration: 1.2, delay: 0.6 },
              y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-1/4 right-8 sm:right-16"
          >
            <GlassCard padding="sm" className="w-48 shadow-glass glass-hover pointer-events-auto flex items-center gap-3">
              <Icons.weatherSun className="h-5 w-5 text-amber-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Weather</p>
                <p className="text-xs font-bold">{destinationName} • 18°C Sunny</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 4: Budget (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
            transition={{
              x: { duration: 1.2, delay: 0.8 },
              y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-1/4 right-8 sm:right-24"
          >
            <GlassCard padding="sm" className="w-48 shadow-glass glass-hover pointer-events-auto flex items-center gap-3">
              <Icons.budget className="h-5 w-5 text-emerald-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Budget</p>
                <p className="text-xs font-bold">Trip Budget • {totalBudget}</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* 4. Full-screen Black Entrance Veil */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 z-50 bg-black"
      />
    </div>
  );
}
