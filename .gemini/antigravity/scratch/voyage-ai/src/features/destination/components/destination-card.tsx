"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/misc-primitives";
import { useDestinationStore } from "../store/use-destination-store";

export function DestinationCard() {
  const { selectedDestination, selectDestination } = useDestinationStore();

  return (
    <AnimatePresence>
      {selectedDestination && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="pointer-events-auto absolute bottom-6 right-6 z-30 w-full max-w-sm sm:bottom-12 sm:right-12"
        >
          <GlassCard padding="none" className="flex flex-col max-h-[80vh] overflow-hidden shadow-glass border-glow">
            {/* Hero Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={selectedDestination.heroImage}
                alt={selectedDestination.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectDestination(null)}
                className="absolute right-3 top-3 h-7 w-7 rounded-full bg-black/40 text-white hover:bg-black/60 glass"
              >
                <Icons.close className="h-4 w-4" />
              </Button>

              {/* Title & Country */}
              <div className="absolute bottom-4 left-4 text-left">
                <Typography variant="title" className="text-white text-xl font-bold">
                  {selectedDestination.name}
                </Typography>
                <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                  <Icons.destination className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedDestination.country}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left custom-scrollbar">
              {/* Key Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 p-2.5">
                  <Icons.time className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Timezone</p>
                    <p className="font-bold">{selectedDestination.timezone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 p-2.5">
                  <Icons.budget className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Currency</p>
                    <p className="font-bold">{selectedDestination.currency.split(" ")[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 p-2.5">
                  <Icons.weatherSun className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Weather</p>
                    <p className="font-bold">{selectedDestination.weather.split(" ")[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 p-2.5">
                  <Icons.auth className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Safety</p>
                    <p className="font-bold">{selectedDestination.safetyScore}/100</p>
                  </div>
                </div>
              </div>

              <Divider text="Travel Facts" />

              {/* Travel Facts List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Daily Budget:</span>
                  <span className="font-bold text-primary">{selectedDestination.dailyBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Season to Visit:</span>
                  <span className="font-bold">{selectedDestination.bestSeason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visa Required:</span>
                  <span className="font-bold">{selectedDestination.visaRequired ? "Yes" : "No (Visa-Free)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Official Language:</span>
                  <span className="font-bold">{selectedDestination.language}</span>
                </div>
              </div>

              <Divider text="Popular Attractions" />

              {/* Attractions Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedDestination.attractions.map((attr) => (
                  <span
                    key={attr}
                    className="rounded bg-white/5 border border-white/10 px-2 py-1 text-[10px] font-semibold hover:border-primary/30 transition-colors cursor-default"
                  >
                    {attr}
                  </span>
                ))}
              </div>

              <Divider text="Quick Facts" />

              {/* Quick Facts Bullet Points */}
              <ul className="space-y-2 text-xs text-muted-foreground/90 list-disc list-inside leading-relaxed">
                {selectedDestination.quickFacts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>

              {/* Start Planning Action Button */}
              <div className="pt-2">
                <Button className="w-full rounded-xl font-semibold glow-primary shadow-md">
                  <Icons.sparkles className="h-4 w-4 mr-2" />
                  Plan Trip to {selectedDestination.name}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
