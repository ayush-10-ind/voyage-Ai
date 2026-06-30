"use client";

import React, { useState } from "react";
import { Day } from "../types";
import { TimelineActivityCard } from "./timeline-activity-card";
import { TimelineConnector } from "./timeline-elements";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Typography } from "@/components/ui/typography";
import { WeatherBadge } from "@/features/weather/components/weather-badge";
import { useTimelineStore } from "../store/use-timeline-store";

interface TimelineDayProps {
  day: Day;
  onEditActivity: (activityIndex: number) => void;
  onDeleteActivity: (activityIndex: number) => void;
  onAddActivity: () => void;
  onMoveActivity: (fromDayNumber: number, fromIndex: number, toDayNumber: number) => void;
}

export function TimelineDay({
  day,
  onEditActivity,
  onDeleteActivity,
  onAddActivity,
  onMoveActivity,
}: TimelineDayProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const trip = useTimelineStore((state) => state.trip);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData("text/plain");
      if (!data) return;

      const { activityIndex, dayNumber } = JSON.parse(data);
      // Move activity if dropped on a different day
      if (dayNumber !== day.dayNumber) {
        onMoveActivity(dayNumber, activityIndex, day.dayNumber);
      }
    } catch (err) {
      console.error("Failed to parse drag data", err);
    }
  };

  // Resolve baseline coordinates from trip destination
  const getBaseCoords = () => {
    if (!trip) return { lat: 35.6762, lng: 139.6503 };
    const dest = trip.destination.toLowerCase().replace(/[^a-z_]/g, "_");
    const coords: Record<string, { lat: number; lng: number }> = {
      tokyo: { lat: 35.6762, lng: 139.6503 },
      paris: { lat: 48.8566, lng: 2.3522 },
      new_york: { lat: 40.7128, lng: -74.0060 },
      london: { lat: 51.5074, lng: -0.1278 },
      zermatt: { lat: 46.0207, lng: 7.7491 },
      reykjavik: { lat: 64.1466, lng: -21.9426 },
      ubud: { lat: -8.5069, lng: 115.2625 },
      tromso: { lat: 69.6492, lng: 18.9553 },
      bali: { lat: -8.4095, lng: 115.1889 },
    };
    return coords[dest] || { lat: 35.6762, lng: 139.6503 };
  };

  const baseCoords = getBaseCoords();
  const dayLat = day.activities[0]?.coordinates?.lat ?? baseCoords.lat;
  const dayLng = day.activities[0]?.coordinates?.lng ?? baseCoords.lng;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border p-5 space-y-4 text-left transition-all duration-300 ${
        isDragOver
          ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30 scale-[1.01]"
          : "bg-white/5 border-white/10"
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Typography variant="body" className="font-bold text-white text-sm">
            Day {day.dayNumber}: {day.title}
          </Typography>
          <WeatherBadge lat={dayLat} lng={dayLng} date={`Day ${day.dayNumber}`} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddActivity}
          className="h-7 px-2 bg-white/5 border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg text-[10px] pointer-events-auto"
        >
          <Icons.plus className="h-3.5 w-3.5 mr-1" />
          Add Event
        </Button>
      </div>

      {/* Activities List */}
      <div className="flex flex-col gap-2 min-h-[50px]">
        {day.activities.length > 0 ? (
          day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id || activity.title + idx}>
              <TimelineActivityCard
                activity={activity}
                index={idx}
                dayNumber={day.dayNumber}
                onEdit={() => onEditActivity(idx)}
                onDelete={() => onDeleteActivity(idx)}
              />
              {idx < day.activities.length - 1 && (
                <TimelineConnector travel={activity.travelToNext} />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="py-8 px-4 text-center text-xs text-muted-foreground/50 border border-dashed border-white/5 rounded-xl flex flex-col items-center gap-3">
            <Icons.calendar className="h-6 w-6 text-muted-foreground/20 animate-pulse" />
            <div className="space-y-1">
              <p className="font-semibold text-white/80">No scheduled events</p>
              <p className="text-[10px] text-muted-foreground/70">Drag activities here or start fresh by adding a new event.</p>
            </div>
            <Button
              onClick={onAddActivity}
              className="h-7 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 rounded-lg text-[10px] pointer-events-auto"
            >
              Add First Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
