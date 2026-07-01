"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LandingView } from "@/features/landing/components/landing-view";
import { useUserContext } from "@/features/auth/context/user-context";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { VoyageLogger } from "@/lib/logger";

export default function Home() {
  const { authenticated } = useUserContext();
  const router = useRouter();

  const handleStartPlanning = (destination?: string) => {
    if (authenticated) {
      VoyageLogger.info("Navigation", "Transition: Landing → Planner (User Authenticated)");
      if (destination) {
        useCopilotStore.getState().resetCopilot();
        useCopilotStore.getState().initializeCopilot(destination);
      }
      router.push("/planner");
    } else {
      VoyageLogger.info("Navigation", "Transition: Landing → Sign In (User Unauthenticated)");
      const destQuery = destination ? `?destination=${encodeURIComponent(destination)}` : "";
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/planner${destQuery}`)}`);
    }
  };

  return <LandingView onStartPlanning={handleStartPlanning} />;
}
