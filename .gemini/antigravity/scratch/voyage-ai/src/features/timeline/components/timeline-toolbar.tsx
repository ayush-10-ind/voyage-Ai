"use client";

import React from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { Chip } from "@/components/ui/misc-primitives";
import { ActivityCategory } from "../types";

export function TimelineToolbar() {
  const { searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, viewMode, setViewMode } = useTimelineStore();

  const categories: { label: string; value: ActivityCategory | "all"; icon: React.ReactNode }[] = [
    { label: "All", value: "all", icon: <Icons.explore className="h-3 w-3" /> },
    { label: "Sightseeing", value: "sightseeing", icon: <Icons.destination className="h-3 w-3" /> },
    { label: "Dining", value: "dining", icon: <Icons.menu className="h-3 w-3" /> },
    { label: "Transit", value: "transit", icon: <Icons.flight className="h-3 w-3" /> },
    { label: "Other", value: "other", icon: <Icons.settings className="h-3 w-3" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl glass shadow-sm pointer-events-auto">
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Icons.search className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 text-xs py-2 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icons.close className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                categoryFilter === cat.value
                  ? "bg-primary border-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl shrink-0 w-full lg:w-auto justify-center sm:justify-start">
        <button
          onClick={() => setViewMode("timeline")}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex-1 lg:flex-none ${
            viewMode === "timeline"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Icons.calendar className="h-3.5 w-3.5" />
          Timeline
        </button>
        <button
          onClick={() => setViewMode("split")}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex-1 lg:flex-none ${
            viewMode === "split"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Icons.explore className="h-3.5 w-3.5" />
          Split Map
        </button>
        <button
          onClick={() => setViewMode("map-focus")}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex-1 lg:flex-none ${
            viewMode === "map-focus"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Icons.explore className="h-3.5 w-3.5 rotate-90" />
          Map Focus
        </button>
      </div>
    </div>
  );
}
