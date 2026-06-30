import { create } from "zustand";
import { MemoryManager, LongTermMemory, TripMemory, SessionMemory } from "../domain/memory";

interface MemoryStoreState {
  longTerm: LongTermMemory;
  tripMemories: Record<string, TripMemory>;
  session: SessionMemory;
  
  // Actions
  updatePreferences: (updates: Partial<LongTermMemory["preferences"]>) => void;
  updateTripNotes: (tripId: string, notes: string) => void;
  addCustomLocation: (tripId: string, location: { name: string; lat: number; lng: number }) => void;
  updateSession: (updates: Partial<SessionMemory>) => void;
}

export const useMemoryStore = create<MemoryStoreState>((set) => ({
  longTerm: MemoryManager.getLongTermMemory(),
  tripMemories: {},
  session: MemoryManager.getSessionMemory(),

  updatePreferences: (updates) => {
    MemoryManager.updateLongTermPreferences(updates);
    set({ longTerm: { ...MemoryManager.getLongTermMemory() } });
  },

  updateTripNotes: (tripId, notes) => {
    MemoryManager.updateTripMemory(tripId, { notes });
    set((state) => ({
      tripMemories: {
        ...state.tripMemories,
        [tripId]: { ...MemoryManager.getTripMemory(tripId) },
      },
    }));
  },

  addCustomLocation: (tripId, location) => {
    const current = MemoryManager.getTripMemory(tripId);
    MemoryManager.updateTripMemory(tripId, {
      customLocations: [...current.customLocations, location],
    });
    set((state) => ({
      tripMemories: {
        ...state.tripMemories,
        [tripId]: { ...MemoryManager.getTripMemory(tripId) },
      },
    }));
  },

  updateSession: (updates) => {
    MemoryManager.updateSessionMemory(updates);
    set({ session: { ...MemoryManager.getSessionMemory() } });
  },
}));
