"use client";

import React, { useEffect } from "react";
import { useCopilotStore } from "../store/use-copilot-store";
import { useDestinationStore } from "@/features/destination/store/use-destination-store";
import { Container, Section, Stack, Grid } from "@/components/ui/layout-helpers";
import { Typography } from "@/components/ui/typography";
import { CopilotChat } from "./copilot-chat";
import { TripSummaryPanel } from "./trip-summary-panel";

export function CopilotView() {
  const { initializeCopilot, resetCopilot } = useCopilotStore();
  const selectedDestination = useDestinationStore((state) => state.selectedDestination);

  useEffect(() => {
    // Initialize the copilot flow. 
    // If the user preselected a destination in the Destination Explorer, pass it in!
    initializeCopilot(selectedDestination?.name);
    
    return () => {
      // Optional: keep conversation in state or reset
      // For this phase, we keep it so they can explore
    };
  }, [selectedDestination, initializeCopilot]);

  return (
    <Section withNoise className="min-h-screen pt-24">
      <Container className="space-y-12">
        {/* Title / Intro */}
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <Typography variant="display" className="text-3xl sm:text-5xl font-bold tracking-tight text-gradient">
            AI Travel Copilot
          </Typography>
          <Typography variant="subtitle" className="text-sm text-muted-foreground">
            Talk to our intelligent travel assistant to craft a tailored, high-fidelity itinerary in real-time.
          </Typography>
        </div>

        {/* Chat & Summary Panel Layout */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-start max-w-4xl mx-auto w-full">
          {/* Conversational Assistant */}
          <CopilotChat />

          {/* Real-time Summary Model */}
          <TripSummaryPanel />
        </div>
      </Container>
    </Section>
  );
}
