"use client";

import React, { useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { TimelineHeader } from "./timeline-header";
import { TimelineToolbar } from "./timeline-toolbar";
import { Timeline } from "./timeline";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { Stack } from "@/components/ui/layout-helpers";
import { MapContainer } from "@/features/map/components/map-container";
import { CommandPalette } from "@/components/ui/command-palette";
import { CommandPalette as CommandRegistry } from "@/features/dev-experience/services/command-palette-service";

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
    undo, 
    redo, 
    trip, 
    selectedActivityId, 
    selectActivity, 
    deleteActivity,
    viewMode,
    setViewMode
  } = useTimelineStore();

  // Initialize the Trip Studio store from the Copilot's generated itinerary
  useEffect(() => {
    if (itinerary && preferences?.destination) {
      initializeFromItinerary(itinerary, preferences.destination);
    }
  }, [itinerary, preferences, initializeFromItinerary]);

  // Register Command Palette Commands dynamically at mount
  useEffect(() => {
    const unsub = [
      CommandRegistry.register({ id: "view-timeline", name: "Switch to Timeline View", category: "Navigation", shortcut: "T", action: () => setViewMode("timeline") }),
      CommandRegistry.register({ id: "view-split", name: "Switch to Split Map View", category: "Navigation", shortcut: "S", action: () => setViewMode("split") }),
      CommandRegistry.register({ id: "view-map-focus", name: "Switch to Map Focus View", category: "Navigation", shortcut: "M", action: () => setViewMode("map-focus") }),
      CommandRegistry.register({ id: "history-undo", name: "Undo Last Timeline Action", category: "Timeline", shortcut: "Ctrl+Z", action: undo }),
      CommandRegistry.register({ id: "history-redo", name: "Redo Last Timeline Action", category: "Timeline", shortcut: "Ctrl+Y", action: redo }),
    ];
    return () => unsub.forEach((fn) => fn());
  }, [setViewMode, undo, redo]);

  // Keyboard Shortcuts for Undo / Redo / Deselect / Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in a form field, don't hijack keyboard actions
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // 1. Undo / Redo (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
        }
      }

      // 2. Escape to deselect
      if (e.key === "Escape") {
        selectActivity(null);
      }

      // 3. Delete or Backspace to delete selected activity
      if ((e.key === "Delete" || e.key === "Backspace") && selectedActivityId && trip) {
        // Find which day the selected activity belongs to
        for (const day of trip.days) {
          const act = day.activities.find((a) => a.id === selectedActivityId);
          if (act) {
            e.preventDefault();
            deleteActivity(day.dayNumber, selectedActivityId);
            selectActivity(null);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectActivity, selectedActivityId, deleteActivity, trip]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        No active trip found. Complete the AI Copilot flow first to start editing.
      </div>
    );
  }

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

  return (
    <Stack gap="lg" className="w-full h-full pb-12 pointer-events-auto">
      {/* Top Meta Navigation Bar */}
      <TimelineHeader />

      {/* Grid Layout: Left Statistics (22%), Center Workspace, Right Context Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Left Sidebar (3 cols) */}
        <div className="md:col-span-3 h-full">
          <LeftSidebar />
        </div>

        {/* Center Workspace (9 cols if split or map-focus, 6 cols if timeline-only) */}
        <Stack gap="md" className={`${viewMode !== "timeline" ? "md:col-span-9" : "md:col-span-6"} h-full flex flex-col justify-between`}>
          <TimelineToolbar />
          {viewMode === "split" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch flex-1">
              <div className="flex flex-col h-full overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                <Timeline />
              </div>
              <div className="h-full min-h-[400px]">
                <MapContainer
                  waypoints={waypoints}
                  activeWaypointId={selectedActivityId}
                  onSelectWaypoint={selectActivity}
                />
              </div>
            </div>
          ) : viewMode === "map-focus" ? (
            <div className="h-full min-h-[500px] flex-1">
              <MapContainer
                waypoints={waypoints}
                activeWaypointId={selectedActivityId}
                onSelectWaypoint={selectActivity}
              />
            </div>
          ) : (
            <Timeline />
          )}
        </Stack>

        {/* Right Sidebar (3 cols, hidden in split/map-focus views to maximize map space) */}
        {viewMode === "timeline" && (
          <div className="md:col-span-3 h-full">
            <RightSidebar />
          </div>
        )}
      </div>
      <CommandPalette />
    </Stack>
  );
}
