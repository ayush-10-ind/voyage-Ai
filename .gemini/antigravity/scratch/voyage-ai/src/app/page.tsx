"use client";

import React, { useState, useEffect } from "react";
import { LandingView } from "@/features/landing/components/landing-view";
import { CopilotView } from "@/features/copilot/components/copilot-view";
import { TripStudio } from "@/features/timeline/components/trip-studio";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { VoyageLogger } from "@/lib/logger";
import { toast } from "sonner";

export default function Home() {
  const [view, setView] = useState<"landing" | "copilot" | "studio">("landing");
  const { itinerary, preferences } = useCopilotStore();

  // Watch itinerary to transition to the Trip Studio automatically
  useEffect(() => {
    if (itinerary && view !== "studio") {
      const destination = preferences.destination || "Tokyo";
      
      // 1. Initialize the timeline store
      useTimelineStore.getState().initializeFromItinerary(itinerary, destination);
      const createdTrip = useTimelineStore.getState().trip;

      // 2. Run Validation Layer
      const validationErrors: string[] = [];
      if (!createdTrip) {
        validationErrors.push("Trip object not created.");
      } else {
        if (!createdTrip.destination) validationErrors.push("Destination missing.");
        if (!createdTrip.days || createdTrip.days.length === 0) {
          validationErrors.push("Trip duration must be greater than 0.");
        } else if (createdTrip.days.length !== (preferences.duration || 5)) {
          validationErrors.push(`Timeline length (${createdTrip.days.length}) does not match requested duration (${preferences.duration || 5}).`);
        }
        if (createdTrip.totalBudget === undefined || createdTrip.totalBudget <= 0) {
          validationErrors.push("Budget not initialized.");
        }
      }

      const totalActivities = createdTrip?.days.flatMap(d => d.activities).length || 0;
      const passed = validationErrors.length === 0;

      // 3. Structured Logging
      VoyageLogger.info("Trip Generator", `[Trip Generator]
Destination: ${destination}
Duration: ${preferences.duration || 5} Days
Generated Days: ${createdTrip?.days.length || 0}
Activities: ${totalActivities}
Budget: ${preferences.budget || "Moderate"}
Validation: ${passed ? "PASSED" : `FAILED (${validationErrors.join(", ")})`}
Trip Studio: ${passed ? "OPENED" : "BLOCKED"}`);

      if (passed) {
        setView("studio");
        toast.success("Trip generated successfully!");
      } else {
        toast.error(`Trip Validation Failed: ${validationErrors.join(". ")}`);
        setView("copilot");
      }
    }
  }, [itinerary, view, preferences]);

  const handleStartPlanning = (destination?: string) => {
    VoyageLogger.info("Navigation", `Transition: Landing → Copilot (Destination: ${destination || "Anywhere"})`);
    useCopilotStore.getState().resetCopilot();
    useCopilotStore.getState().initializeCopilot(destination);
    setView("copilot");
  };

  if (view === "studio") {
    return <TripStudio />;
  }

  if (view === "copilot") {
    return <CopilotView />;
  }

  return <LandingView onStartPlanning={handleStartPlanning} />;
}
