"use client";

import React, { useState, useEffect } from "react";
import { LandingView } from "@/features/landing/components/landing-view";
import { CopilotView } from "@/features/copilot/components/copilot-view";
import { TripStudio } from "@/features/timeline/components/trip-studio";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { VoyageLogger } from "@/lib/logger";

export default function Home() {
  const [view, setView] = useState<"landing" | "copilot" | "studio">("landing");
  const { itinerary } = useCopilotStore();

  // Watch itinerary to transition to the Trip Studio automatically
  useEffect(() => {
    if (itinerary && view !== "studio") {
      VoyageLogger.info("Navigation", "Transition: Trip Generation → Timeline (Opening Trip Studio)");
      setView("studio");
    }
  }, [itinerary, view]);

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
