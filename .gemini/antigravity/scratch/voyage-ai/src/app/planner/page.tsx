"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { CopilotView } from "@/features/copilot/components/copilot-view";
import { TripStudio } from "@/features/timeline/components/trip-studio";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { useUserContext } from "@/features/auth/context/user-context";
import { TripDBService } from "@/services/db/trip-db-service";
import { ProfileDBService } from "@/services/db/profile-db-service";
import { VoyageLogger } from "@/lib/logger";
import { toast } from "sonner";

export default function PlannerPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 bg-[#070b19] flex flex-col items-center justify-center gap-4 z-50">
          <div className="h-16 w-16 relative">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
            Loading Workspace...
          </p>
        </div>
      }>
        <PlannerContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function PlannerContent() {
  const { user } = useUserContext();
  const { itinerary, preferences } = useCopilotStore();
  const { trip } = useTimelineStore();
  const [view, setView] = useState<"copilot" | "studio">("copilot");
  const [isRestoring, setIsRestoring] = useState(true);
  const searchParams = useSearchParams();
  const destinationParam = searchParams ? searchParams.get("destination") : null;

  // Restore active trip from local cache on mount
  useEffect(() => {
    const restoreActiveTrip = async () => {
      if (typeof window === "undefined" || !user?.id) {
        setIsRestoring(false);
        return;
      }
      
      const activeTripId = localStorage.getItem("voyage_active_trip_id");
      if (activeTripId && !trip) {
        try {
          VoyageLogger.info("DB", `Restoring active trip on page mount: ${activeTripId}`);
          const userTrips = await TripDBService.fetchUserTrips(user.id);
          const found = userTrips.find((t) => t.id === activeTripId);
          if (found) {
            useTimelineStore.getState().loadTripFromDB(found);
            useCopilotStore.getState().loadFromSavedTrip(found);
            setView("studio");
          }
        } catch (e) {
          console.error("Failed to restore active trip", e);
        }
      }
      setIsRestoring(false);
    };

    restoreActiveTrip();
  }, [user?.id, trip]);

  // Initialize preselected destination from query parameters if present
  useEffect(() => {
    if (destinationParam && !preferences.destination && !itinerary && !isRestoring) {
      VoyageLogger.info("Navigation", `Initializing Planner with preselected destination: ${destinationParam}`);
      useCopilotStore.getState().resetCopilot();
      useCopilotStore.getState().initializeCopilot(destinationParam);
    }
  }, [destinationParam, preferences.destination, itinerary, isRestoring]);

  // Automatically transition based on itinerary state
  useEffect(() => {
    if (itinerary && !isRestoring) {
      const destination = preferences.destination || destinationParam || "Tokyo";
      
      // Initialize timeline if not already done
      if (!trip || trip.destination !== destination) {
        useTimelineStore.getState().initializeFromItinerary(itinerary, destination);
      }
      
      const createdTrip = useTimelineStore.getState().trip;

      // Run Validation Layer
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
        if (createdTrip.travelerCount === undefined || createdTrip.travelerCount <= 0) {
          validationErrors.push("Traveler count not initialized.");
        }
      }

      const totalActivities = createdTrip?.days.flatMap(d => d.activities).length || 0;
      const passed = validationErrors.length === 0;

      // Log step
      VoyageLogger.info("Trip Generator", `[Trip Generator]
Destination: ${destination}
Duration: ${preferences.duration || 5} Days
Generated Days: ${createdTrip?.days.length || 0}
Activities: ${totalActivities}
Budget: ${preferences.budget || "Moderate"}
Validation: ${passed ? "PASSED" : `FAILED (${validationErrors.join(", ")})`}
Trip Studio: ${passed ? "OPENED" : "BLOCKED"}`);

      if (passed) {
        // Sync preferences long-term to database Profiles.preferences
        if (user?.id) {
          const userLongTermPrefs = {
            preferredBudget: preferences.budget || "moderate",
            preferredTravelStyle: preferences.style || preferences.travelStyle || "balanced",
            favoriteDestinations: [destination],
            transportationPreference: preferences.transportationPreference || "Public Transport",
            accommodationPreference: preferences.accommodationType || "Standard Room"
          };
          ProfileDBService.updatePreferences(user.id, userLongTermPrefs)
            .then(() => VoyageLogger.info("DB", "Updated user long-term preferences in Profile"))
            .catch((err) => console.error("Failed to update preferences", err));
        }

        setView("studio");
      } else {
        toast.error(`Trip Validation Failed: ${validationErrors.join(". ")}`);
        setView("copilot");
      }
    } else if (!itinerary && !isRestoring) {
      setView("copilot");
    }
  }, [itinerary, preferences, trip, destinationParam, isRestoring, user?.id]);

  if (isRestoring) {
    return (
      <div className="fixed inset-0 bg-[#02040a] flex flex-col items-center justify-center gap-4 z-50">
        <div className="h-10 w-10 relative">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
          Restoring active session...
        </p>
      </div>
    );
  }

  if (view === "studio" && trip) {
    return <TripStudio />;
  }

  return <CopilotView />;
}
