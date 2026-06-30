import { VoyageLogger } from "@/lib/logger";

// 1. Long-Term Memory Interface
export interface LongTermMemory {
  preferences: {
    budgetStyle: "budget" | "mid" | "luxury";
    transitPreferences: Array<"walking" | "driving" | "transit" | "cycling">;
    accommodationPreference: "hotel" | "hostel" | "rental" | "resort";
    interests: string[];
    foodPreferences: string[];
  };
  savedDestinations: string[];
}

// 2. Trip Memory Interface (bound to the active trip lifecycle)
export interface TripMemory {
  tripId: string;
  notes: string;
  customLocations: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
  dismissedAlertIds: string[];
}

// 3. Session Memory Interface (ephemeral UI states)
export interface SessionMemory {
  activeSidebarTab: "overview" | "finance";
  isMapExpanded: boolean;
  expandedTimelineDayIndex: number | null;
  lastSearchedQuery: string;
}

/**
 * MemoryManager provides isolated interfaces and lifecycle management for the three memory domains.
 */
class MemoryManagerService {
  private longTermMemory: LongTermMemory = {
    preferences: {
      budgetStyle: "mid",
      transitPreferences: ["walking", "transit"],
      accommodationPreference: "hotel",
      interests: ["culture", "sightseeing", "nature"],
      foodPreferences: ["local_cuisine", "street_food"],
    },
    savedDestinations: ["Tokyo", "Paris"],
  };

  private tripMemory: Map<string, TripMemory> = new Map();
  private sessionMemory: SessionMemory = {
    activeSidebarTab: "overview",
    isMapExpanded: false,
    expandedTimelineDayIndex: null,
    lastSearchedQuery: "",
  };

  // --- Long-Term Memory Lifecycle ---
  getLongTermMemory(): LongTermMemory {
    return this.longTermMemory;
  }

  updateLongTermPreferences(updates: Partial<LongTermMemory["preferences"]>): void {
    this.longTermMemory.preferences = {
      ...this.longTermMemory.preferences,
      ...updates,
    };
    VoyageLogger.info("Memory", "Updated long-term preferences", updates);
  }

  // --- Trip Memory Lifecycle ---
  getTripMemory(tripId: string): TripMemory {
    if (!this.tripMemory.has(tripId)) {
      this.tripMemory.set(tripId, {
        tripId,
        notes: "",
        customLocations: [],
        dismissedAlertIds: [],
      });
    }
    return this.tripMemory.get(tripId)!;
  }

  updateTripMemory(tripId: string, updates: Partial<Omit<TripMemory, "tripId">>): void {
    const current = this.getTripMemory(tripId);
    this.tripMemory.set(tripId, {
      ...current,
      ...updates,
    });
    VoyageLogger.info("Memory", `Updated trip memory for trip: ${tripId}`, updates);
  }

  clearTripMemory(tripId: string): void {
    this.tripMemory.delete(tripId);
    VoyageLogger.info("Memory", `Cleared trip memory for trip: ${tripId}`);
  }

  // --- Session Memory Lifecycle ---
  getSessionMemory(): SessionMemory {
    return this.sessionMemory;
  }

  updateSessionMemory(updates: Partial<SessionMemory>): void {
    this.sessionMemory = {
      ...this.sessionMemory,
      ...updates,
    };
    VoyageLogger.debug("Memory", "Updated ephemeral session memory", updates);
  }

  resetSessionMemory(): void {
    this.sessionMemory = {
      activeSidebarTab: "overview",
      isMapExpanded: false,
      expandedTimelineDayIndex: null,
      lastSearchedQuery: "",
    };
    VoyageLogger.debug("Memory", "Reset session memory");
  }
}

export const MemoryManager = new MemoryManagerService();
export type MemoryManagerType = typeof MemoryManager;
