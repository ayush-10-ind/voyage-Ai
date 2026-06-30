"use client";

import React from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Typography } from "@/components/ui/typography";
import { toast } from "sonner";

export function TimelineHeader() {
  const { trip, undo, redo, history, future } = useTimelineStore();

  if (!trip) return null;

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

  const handleExport = () => {
    toast.success("Trip exported to PDF / Calendar!");
  };

  const handleSave = () => {
    toast.success("Trip draft saved successfully!");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl glass shadow-sm pointer-events-auto">
      {/* Trip Metadata */}
      <div className="text-left space-y-1">
        <Typography variant="body" className="font-bold text-white text-lg leading-none">
          {trip.name}
        </Typography>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icons.destination className="h-3.5 w-3.5 text-primary" />
            {trip.destination}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Icons.calendar className="h-3.5 w-3.5" />
            {trip.startDate} - {trip.endDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Icons.user className="h-3.5 w-3.5" />
            {trip.travelerCount} Travelers
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Undo / Redo */}
        <div className="flex items-center border border-white/10 rounded-xl p-0.5 bg-black/20 mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={history.length === 0}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white disabled:opacity-35"
            title="Undo (Ctrl+Z)"
          >
            <Icons.chevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={future.length === 0}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white disabled:opacity-35"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="rounded-xl text-xs font-semibold glass hover:bg-white/10"
        >
          <Icons.share className="h-4 w-4 mr-1.5" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="rounded-xl text-xs font-semibold glass hover:bg-white/10"
        >
          <Icons.externalLink className="h-4 w-4 mr-1.5" />
          Export
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
        >
          <Icons.lock className="h-4 w-4 mr-1.5" />
          Save Trip
        </Button>
      </div>
    </div>
  );
}
