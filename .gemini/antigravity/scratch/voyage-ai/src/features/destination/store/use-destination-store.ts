import { create } from "zustand";
import { Destination } from "../types";

interface DestinationState {
  selectedDestination: Destination | null;
  searchQuery: string;
  recentSearches: string[];
  selectDestination: (destination: Destination | null) => void;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (cityName: string) => void;
  clearRecentSearches: () => void;
}

export const useDestinationStore = create<DestinationState>((set) => ({
  selectedDestination: null,
  searchQuery: "",
  recentSearches: ["Tokyo", "Switzerland"], // Initial recent searches for demo

  selectDestination: (destination) => set({ selectedDestination: destination }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addRecentSearch: (cityName) =>
    set((state) => {
      // Keep only unique and max 5 recent searches
      const filtered = state.recentSearches.filter((name) => name !== cityName);
      return { recentSearches: [cityName, ...filtered].slice(0, 5) };
    }),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
