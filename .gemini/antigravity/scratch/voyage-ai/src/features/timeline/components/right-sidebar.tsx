"use client";

import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { MapContainer } from "@/features/map/components/map-container";

export function RightSidebar() {
  const { trip, selectedActivityId, selectActivity, deleteActivity } = useTimelineStore();

  // Find the selected activity and its day
  let selectedActivity: any = null;
  let selectedDayNumber = 1;

  if (trip) {
    // If no activity is selected, default to the first activity of the first day so it is never blank!
    if (!selectedActivityId) {
      const firstDay = trip.days[0];
      if (firstDay && firstDay.activities.length > 0) {
        selectedActivity = firstDay.activities[0];
        selectedDayNumber = 1;
      }
    } else {
      for (const day of trip.days) {
        const act = day.activities.find((a) => a.id === selectedActivityId);
        if (act) {
          selectedActivity = act;
          selectedDayNumber = day.dayNumber;
          break;
        }
      }
    }
  }

  if (!trip) return null;

  // Compile waypoints from all trip activities
  const waypoints = trip.days.flatMap((day) =>
    day.activities
      .filter((act) => act.coordinates)
      .map((act, idx) => ({
        id: act.id,
        title: act.title,
        lat: act.coordinates!.lat,
        lng: act.coordinates!.lng,
        sequence: idx + 1,
        time: act.time,
        category: act.category,
      }))
  );

  const getDirectionsUrl = () => {
    if (!selectedActivity) return "#";
    const dest = encodeURIComponent(selectedActivity.title + (selectedActivity.address ? `, ${selectedActivity.address}` : ""));
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  };

  return (
    <GlassCard padding="none" className="w-full h-full flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left min-h-[600px] overflow-hidden">
      {/* Interactive Map (Top of Right Sidebar) */}
      <div className="h-[210px] w-full border-b border-white/10 relative overflow-hidden">
        <MapContainer
          waypoints={waypoints}
          activeWaypointId={selectedActivityId}
          onSelectWaypoint={selectActivity}
        />
      </div>

      {/* Place Details */}
      {selectedActivity ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {/* Header name */}
          <div>
            <span className="text-[9px] uppercase font-bold text-primary">Selected Destination</span>
            <Typography variant="body" className="font-bold text-white text-base leading-tight mt-0.5">
              {selectedActivity.title}
            </Typography>
          </div>

          {/* Metadata properties */}
          <div className="space-y-2 text-zinc-300">
            {selectedActivity.address && (
              <div className="flex items-start gap-2">
                <Icons.destination className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{selectedActivity.address}</span>
              </div>
            )}
            {selectedActivity.openingHours && (
              <div className="flex items-center gap-2">
                <Icons.time className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Opening Hours: {selectedActivity.openingHours}</span>
              </div>
            )}
            {selectedActivity.visitDuration && (
              <div className="flex items-center gap-2">
                <Icons.calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Duration: {selectedActivity.visitDuration}</span>
              </div>
            )}
          </div>

          {/* Large Get Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow text-[11px] uppercase tracking-wider"
          >
            <Icons.explore className="h-4 w-4" />
            Get Directions
          </a>

          {/* Best Route Options */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Best Route (from your location)</span>
            
            {/* Walk */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <Icons.time className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="font-semibold text-white">Walk</p>
                  <p className="text-[9px] text-zinc-400">Best for experience</p>
                </div>
              </div>
              <span className="font-bold text-white text-right">18 min <span className="text-[9px] font-medium text-zinc-400 block">(1.2 km)</span></span>
            </div>

            {/* Metro */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <Icons.flight className="h-4 w-4 text-primary rotate-90" />
                <div>
                  <p className="font-semibold text-white">Metro</p>
                  <p className="text-[9px] text-zinc-400">Fastest transit route</p>
                </div>
              </div>
              <span className="font-bold text-white">12 min</span>
            </div>

            {/* Taxi */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <Icons.lock className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-white">Taxi / Ride</p>
                  <p className="text-[9px] text-zinc-400">Most comfortable</p>
                </div>
              </div>
              <span className="font-bold text-white">7 min</span>
            </div>
          </div>

          {/* About this place */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">About this place</span>
            <p className="text-[11px] text-zinc-400 leading-normal">
              {selectedActivity.description || "Explore this iconic landmark location matching your selected preferences."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-5 gap-3">
          <Icons.info className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Select any activity card to explore route and directions.</p>
        </div>
      )}
    </GlassCard>
  );
}
