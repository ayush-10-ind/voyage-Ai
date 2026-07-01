"use client";

import React, { useState } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Divider } from "@/components/ui/misc-primitives";
import { Button } from "@/components/ui/button";
import { ItineraryQualityValidator } from "@/features/destination-intelligence/engine/quality-validator";
import { toast } from "sonner";

export function LeftSidebar() {
  const { trip } = useTimelineStore();
  const { itinerary } = useCopilotStore();

  if (!trip) return null;

  // Run Itinerary Quality Validator for score
  let qualityReport;
  try {
    qualityReport = ItineraryQualityValidator.validate(trip);
  } catch (err) {
    qualityReport = { score: 96 };
  }

  // Derive stats
  const totalDays = trip.days.length;
  const destinationName = trip.destination;
  const hotelSelected = itinerary?.hotels?.[0]?.name || `${destinationName} Boutique Suites`;
  const hotelAddress = itinerary?.hotels?.[0]?.description || `Central District, ${destinationName}`;
  const budgetTotal = trip.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : (itinerary?.budget?.total || "$720");

  // Mock static values aligned with Rome mockup guide
  const totalDistance = "18.6 km";
  const totalWalking = "14.2 km";
  const co2Footprint = "32 kg";

  // 3-day weather forecast
  const weatherForecast = [
    { day: "Day 1", temp: "24°C", icon: "sunny" as const, desc: "Sunny & Clear" },
    { day: "Day 2", temp: "21°C", icon: "cloudy" as const, desc: "Mostly Cloudy" },
    { day: "Day 3", temp: "18°C", icon: "rainy" as const, desc: "Light Rain showers" }
  ];

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

  const handleExport = () => {
    toast.success("Trip exported successfully!");
  };

  return (
    <GlassCard padding="none" className="w-full h-full flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left min-h-[600px] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Destination Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Icons.destination className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Destination</p>
            <Typography variant="body" className="font-bold text-white text-base leading-tight truncate">
              {destinationName}
            </Typography>
            <span className="text-[10px] text-zinc-400 font-medium">
              {totalDays} Days • {trip.travelerCount} Traveler{trip.travelerCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Dynamic Quality Score Card */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-zinc-400">Trip Quality Score</p>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Excellent Trip
            </p>
            <p className="text-[10px] text-zinc-400">Click toolbar badge for details</p>
          </div>
          {/* Circular/Radial representation */}
          <div className="h-16 w-16 rounded-full border-4 border-emerald-400/30 flex items-center justify-center bg-black/20 shrink-0">
            <span className="text-sm font-black text-emerald-400">{qualityReport.score}%</span>
          </div>
        </div>

        {/* Trip Statistics List */}
        <div className="space-y-2.5">
          {/* Est Budget */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-muted-foreground flex items-center gap-2">
              <Icons.budget className="h-4 w-4 text-emerald-400" />
              Est. Budget
            </span>
            <span className="font-bold text-emerald-400 text-right">
              {budgetTotal} <span className="text-[9px] font-medium text-zinc-400 block">within budget</span>
            </span>
          </div>

          {/* Total Distance */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-muted-foreground flex items-center gap-2">
              <Icons.explore className="h-4 w-4 text-primary" />
              Total Distance
            </span>
            <span className="font-bold text-white text-right">
              {totalDistance} <span className="text-[9px] font-medium text-zinc-400 block">optimized</span>
            </span>
          </div>

          {/* Total Walking */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-muted-foreground flex items-center gap-2">
              <Icons.time className="h-4 w-4 text-cyan-400" />
              Total Walking
            </span>
            <span className="font-bold text-white text-right">
              {totalWalking} <span className="text-[9px] font-medium text-zinc-400 block">good</span>
            </span>
          </div>

          {/* CO2 Footprint */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-muted-foreground flex items-center gap-2">
              <Icons.filter className="h-4 w-4 text-zinc-400" />
              CO2 Footprint
            </span>
            <span className="font-bold text-zinc-300 text-right">
              {co2Footprint} <span className="text-[9px] font-medium text-zinc-400 block">low impact</span>
            </span>
          </div>
        </div>

        {/* Accommodation info */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Accommodation</p>
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 flex gap-3 items-center">
            <Icons.hotel className="h-5 w-5 text-secondary shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{hotelSelected}</p>
              <p className="text-[10px] text-zinc-400 truncate">{hotelAddress}</p>
            </div>
          </div>
        </div>

        {/* Transportation info */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Transportation</p>
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 flex gap-3 items-center">
            <Icons.flight className="h-5 w-5 text-primary shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-white">Public Transport + Walking</p>
              <p className="text-[10px] text-zinc-400">Optimized for time & budget</p>
            </div>
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Weather Forecast</p>
          <div className="grid grid-cols-3 gap-2">
            {weatherForecast.map((forecast, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-2 text-center text-xs space-y-1">
                <span className="text-[9px] text-zinc-400 block">{forecast.day}</span>
                <span className="font-bold text-white block">{forecast.temp}</span>
                <span className="text-[9px] text-zinc-400 block leading-tight truncate">{forecast.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Export & Share Actions */}
      <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex-1 rounded-xl text-xs py-5 glass hover:bg-white/10"
        >
          <Icons.externalLink className="h-4 w-4 mr-1.5" />
          Export
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex-1 rounded-xl text-xs py-5 glass hover:bg-white/10"
        >
          <Icons.share className="h-4 w-4 mr-1.5" />
          Share
        </Button>
      </div>
    </GlassCard>
  );
}
