"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Divider } from "@/components/ui/misc-primitives";
import { useDestinationStore } from "../store/use-destination-store";
import { DESTINATIONS, POPULAR_DESTINATIONS, TRENDING_DESTINATIONS } from "../constants";

export function DestinationSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedDestination,
    searchQuery,
    recentSearches,
    selectDestination,
    setSearchQuery,
    addRecentSearch,
    clearRecentSearches,
  } = useDestinationStore();

  // Close search dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter destinations based on search query
  const filteredSuggestions = DESTINATIONS.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    const dest = DESTINATIONS.find((d) => d.id === id);
    if (dest) {
      selectDestination(dest);
      addRecentSearch(dest.name);
      setSearchQuery("");
      setIsFocused(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm pointer-events-auto z-40">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Icons.search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search any destination..."
          className="pl-10 pr-9 py-5 bg-white/5 border-white/10 hover:border-white/20 focus:border-primary/50 rounded-xl glass shadow-glass font-medium text-sm text-white placeholder:text-muted-foreground/80 transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icons.close className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2"
          >
            <GlassCard padding="sm" className="w-full max-h-80 overflow-y-auto flex flex-col gap-4 shadow-glass text-left border-glow custom-scrollbar">
              {searchQuery ? (
                // Filtered List
                <div className="flex flex-col gap-1">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelect(dest.id)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-xs font-semibold text-white group transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icons.destination className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                          <div>
                            <p>{dest.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{dest.country}</p>
                          </div>
                        </div>
                        <Icons.arrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No destinations found.
                    </div>
                  )}
                </div>
              ) : (
                // Default Suggestions (Recent, Popular, Trending)
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Recent</span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] text-primary/80 hover:text-primary hover:underline font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {recentSearches.map((name) => {
                          const dest = DESTINATIONS.find((d) => d.name === name);
                          return (
                            <button
                              key={name}
                              onClick={() => dest && handleSelect(dest.id)}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-muted-foreground hover:text-white transition-colors text-left"
                            >
                              <Icons.time className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span>{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Popular Destinations */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Popular</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_DESTINATIONS.map((name) => {
                        const dest = DESTINATIONS.find((d) => d.name === name);
                        return (
                          <button
                            key={name}
                            onClick={() => dest && handleSelect(dest.id)}
                            className="rounded-full bg-white/5 border border-white/10 hover:border-primary/40 px-3 py-1 text-[10px] font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trending */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Trending Now</span>
                    <div className="flex flex-col gap-0.5">
                      {TRENDING_DESTINATIONS.map((name) => {
                        const dest = DESTINATIONS.find((d) => d.name === name);
                        return (
                          <button
                            key={name}
                            onClick={() => dest && handleSelect(dest.id)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-semibold text-white group transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Icons.sparkles className="h-3.5 w-3.5 text-secondary" />
                              <span>{name}</span>
                            </div>
                            <Icons.arrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
