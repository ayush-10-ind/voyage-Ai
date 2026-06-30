"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCopilotStore } from "../store/use-copilot-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/misc-primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/features/timeline";

export function ItineraryDisplay() {
  const { itinerary, regenerateItinerary } = useCopilotStore();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!itinerary) return null;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto mt-12 space-y-8 pointer-events-auto pb-24"
    >
      {/* 1. Trip Overview Hero */}
      <GlassCard padding="lg" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-glass border-glow text-left bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
            <Icons.sparkles className="h-3 w-3" />
            AI Tailored Itinerary
          </div>
          <Typography variant="title" className="text-white text-2xl font-bold">
            Your Bespoke Travel Plan
          </Typography>
          <Typography variant="body" className="text-muted-foreground leading-relaxed">
            {itinerary.overview}
          </Typography>
        </div>
        <Button
          onClick={regenerateItinerary}
          variant="outline"
          className="rounded-xl font-semibold glass hover:bg-white/10"
        >
          <Icons.edit className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </GlassCard>

      {/* 2. Detail Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-8 bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="timeline" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Timeline</TabsTrigger>
          <TabsTrigger value="hotels" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Lodging</TabsTrigger>
          <TabsTrigger value="budget" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Budget</TabsTrigger>
          <TabsTrigger value="packing" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Checklist</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Timeline />
        </TabsContent>

        {/* Lodging Tab */}
        <TabsContent value="hotels" className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {itinerary.hotels.map((hotel) => (
            <GlassCard key={hotel.name} padding="md" className="shadow-glass flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <Typography variant="body" className="font-bold text-white">
                    {hotel.name}
                  </Typography>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    ★ {hotel.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{hotel.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-muted-foreground">Estimated Rate</span>
                <span className="text-sm font-bold text-primary">{hotel.price}</span>
              </div>
            </GlassCard>
          ))}
          {/* Flights Placeholder */}
          <GlassCard padding="md" className="shadow-glass border-dashed border-white/10 flex flex-col justify-center items-center gap-3 opacity-80 sm:col-span-2 py-8">
            <Icons.flight className="h-8 w-8 text-muted-foreground/60 animate-bounce" />
            <div className="text-center space-y-1">
              <Typography variant="body" className="font-semibold text-white text-sm">
                Flight Search Pending
              </Typography>
              <p className="text-xs text-muted-foreground">
                Connect your carrier account or search live flights in the next phase.
              </p>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6 text-left">
          <GlassCard padding="lg" className="shadow-glass grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget Card */}
            <div className="flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6 gap-2 text-center">
              <Typography variant="caption" className="text-xs uppercase tracking-wider text-muted-foreground">
                Total Est. Budget
              </Typography>
              <Typography variant="display" className="text-4xl font-bold text-gradient">
                {itinerary.budget.total}
              </Typography>
            </div>
            
            {/* Breakdown Bars */}
            <div className="md:col-span-2 space-y-4">
              <Typography variant="body" className="font-semibold text-white text-sm">
                Budget Allocation
              </Typography>
              <div className="space-y-3">
                {itinerary.budget.breakdown.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="text-white">{item.cost}</span>
                    </div>
                    {/* Progress Bar Simulation */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: item.category === "Accommodation" || item.category === "Hotels" ? "65%" : "35%"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="packing" className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Packing List */}
          <GlassCard padding="md" className="shadow-glass space-y-4">
            <Typography variant="body" className="font-bold text-white text-sm flex items-center gap-1.5">
              <Icons.packing className="h-4 w-4 text-primary" />
              Smart Packing Assistant
            </Typography>
            <div className="space-y-2">
              {itinerary.packingList.map((item) => (
                <label
                  key={item}
                  onClick={() => toggleCheck(item)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs font-semibold text-white"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item]}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-white/10 bg-black/40 text-primary focus:ring-primary/40 pointer-events-none"
                  />
                  <span className={checkedItems[item] ? "line-through text-muted-foreground/60" : ""}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </GlassCard>

          {/* Hidden Gems & Safety */}
          <div className="space-y-6">
            <GlassCard padding="md" className="shadow-glass space-y-3">
              <Typography variant="body" className="font-bold text-white text-sm flex items-center gap-1.5">
                <Icons.sparkles className="h-4 w-4 text-secondary" />
                Hidden Gems
              </Typography>
              <ul className="space-y-2 text-xs text-muted-foreground/90 list-disc list-inside leading-relaxed">
                {itinerary.hiddenGems.map((gem) => (
                  <li key={gem}>{gem}</li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard padding="md" className="shadow-glass space-y-3">
              <Typography variant="body" className="font-bold text-white text-sm flex items-center gap-1.5">
                <Icons.warning className="h-4 w-4 text-amber-400" />
                Local Safety Tips
              </Typography>
              <ul className="space-y-2 text-xs text-muted-foreground/90 list-disc list-inside leading-relaxed">
                {itinerary.safetyTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
// 
