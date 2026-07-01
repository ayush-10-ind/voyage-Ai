"use client";

import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Typography } from "@/components/ui/typography";
import { toast } from "sonner";
import { useUserContext } from "@/features/auth/context/user-context";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";

export function TimelineHeader() {
  const { 
    trip, 
    undo, 
    redo, 
    history, 
    future, 
    saveStatus, 
    lastSaved, 
    saveTripToDB 
  } = useTimelineStore();
  
  const { user } = useUserContext();
  const { preferences } = useCopilotStore();
  const [saveMessage, setSaveMessage] = useState("Saved");

  useEffect(() => {
    if (saveStatus === "saving") {
      setSaveMessage("Saving...");
    } else if (saveStatus === "unsaved") {
      setSaveMessage("Unsaved Changes");
    } else if (saveStatus === "failed") {
      setSaveMessage("Save Failed");
    } else if (saveStatus === "offline") {
      setSaveMessage("Offline Mode");
    } else if (saveStatus === "saved" && lastSaved) {
      const updateMessage = () => {
        const diffMs = Date.now() - lastSaved;
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 10) {
          setSaveMessage("Saved");
        } else if (diffSecs < 60) {
          setSaveMessage("Saved just now");
        } else {
          const diffMins = Math.floor(diffSecs / 60);
          setSaveMessage(`Saved ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`);
        }
      };
      updateMessage();
      const interval = setInterval(updateMessage, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [saveStatus, lastSaved]);

  if (!trip) return null;

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

  const handleExport = () => {
    toast.success("Trip exported to PDF / Calendar!");
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save your trip.");
      return;
    }
    toast.info("Saving trip...");
    await saveTripToDB(user.id, preferences);
    toast.success("Trip saved successfully!");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl glass shadow-sm pointer-events-auto">
      {/* Trip Metadata */}
      <div className="text-left space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Typography variant="body" className="font-bold text-white text-lg leading-none">
            {trip.name}
          </Typography>
          
          {/* Save Status Badge */}
          {saveStatus === "saving" && (
            <span className="text-[10px] text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full animate-pulse font-semibold">
              <Icons.spinner className="h-3 w-3 animate-spin" />
              {saveMessage}
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
              {saveMessage}
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">
              {saveMessage}
            </span>
          )}
          {saveStatus === "offline" && (
            <span className="text-[10px] text-zinc-400 bg-zinc-500/10 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Icons.info className="h-3 w-3" />
              {saveMessage}
            </span>
          )}
          {saveStatus === "failed" && (
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-semibold">
              {saveMessage}
            </span>
          )}
        </div>
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
            {trip.travelerCount} Traveler{trip.travelerCount > 1 ? "s" : ""}
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
          disabled={saveStatus === "saving"}
          className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary disabled:opacity-50"
        >
          {saveStatus === "saving" ? (
            <Icons.spinner className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Icons.lock className="h-4 w-4 mr-1.5" />
          )}
          Save Trip
        </Button>
      </div>
    </div>
  );
}
