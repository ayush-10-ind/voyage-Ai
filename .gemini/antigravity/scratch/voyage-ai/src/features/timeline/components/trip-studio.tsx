"use client";

import React, { useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { useUserContext } from "@/features/auth/context/user-context";
import { TripDBService } from "@/services/db/trip-db-service";
import { toast } from "sonner";
import { TimelineHeader } from "./timeline-header";
import { TimelineToolbar } from "./timeline-toolbar";
import { Timeline } from "./timeline";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { Stack } from "@/components/ui/layout-helpers";
import { Icons } from "@/components/ui/icons";

// Kernel & Provider Registry
import { VoyageKernel } from "@/lib/kernel";
import { mapboxProvider } from "@/features/map/providers/mapbox-provider";
import { openWeatherProvider } from "@/features/weather/providers/open-weather-provider";
import { MockAIProvider } from "@/features/copilot/providers/ai-provider";

VoyageKernel.registerProvider("map", mapboxProvider);
VoyageKernel.registerProvider("weather", openWeatherProvider);
VoyageKernel.registerProvider("ai", new MockAIProvider());
VoyageKernel.bootstrap();

export function TripStudio() {
  const { itinerary, preferences } = useCopilotStore();
  const { 
    initializeFromItinerary, 
    trip, 
    saveTripToDB,
    saveStatus
  } = useTimelineStore();
  
  const { user } = useUserContext();

  // Initialize the Trip Studio store from the Copilot's generated itinerary
  useEffect(() => {
    if (itinerary && preferences?.destination) {
      initializeFromItinerary(itinerary, preferences.destination);
    }
  }, [itinerary, preferences, initializeFromItinerary]);

  // Debounced auto-save effect (2 seconds)
  useEffect(() => {
    if (!trip || !user?.id) return;
    if (saveStatus !== "unsaved") return;

    const timer = setTimeout(async () => {
      try {
        await saveTripToDB(user.id, preferences);
      } catch (err) {
        console.error("Auto-save error", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [trip, user?.id, preferences, saveStatus, saveTripToDB]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        No active trip found. Complete the AI Copilot flow first to start editing.
      </div>
    );
  }

  return (
    <Stack gap="lg" className="w-full h-full pb-12 pointer-events-auto">
      {/* Top Meta Navigation Bar */}
      <TimelineHeader />

      {/* Grid Layout: Left Statistics (3 cols), Center Workspace (6 cols), Right Directions (3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Sidebar (3 cols) */}
        <div className="md:col-span-3 h-full">
          <LeftSidebar />
        </div>

        {/* Center Workspace (6 cols) */}
        <Stack gap="md" className="md:col-span-6 h-full flex flex-col justify-between">
          {/* AI Optimization Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center justify-between text-left text-xs text-white">
            <div className="flex items-center gap-2">
              <Icons.sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse" />
              <span>AI optimized this trip considering weather, distance, budget, opening hours, crowd levels & your preferences.</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold cursor-pointer hover:text-white shrink-0 ml-2">Learn more</span>
          </div>

          <TimelineToolbar />
          
          <div className="flex flex-col h-full overflow-y-auto max-h-[620px] pr-1 custom-scrollbar">
            <Timeline />
          </div>
        </Stack>

        {/* Right Sidebar (3 cols) */}
        <div className="md:col-span-3 h-full">
          <RightSidebar />
        </div>
      </div>
    </Stack>
  );
}
