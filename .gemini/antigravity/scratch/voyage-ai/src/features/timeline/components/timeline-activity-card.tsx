import React, { memo } from "react";
import { motion } from "framer-motion";
import { Activity } from "../types";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useTimelineStore } from "../store/use-timeline-store";
import { SelectionOutline } from "./timeline-elements";

interface TimelineActivityCardProps {
  activity: Activity;
  index: number;
  dayNumber: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const TimelineActivityCard = memo(function TimelineActivityCard({
  activity,
  index,
  dayNumber,
  onEdit,
  onDelete,
}: TimelineActivityCardProps) {
  const { selectedActivityId, selectActivity, updateActivity } = useTimelineStore();
  const isSelected = selectedActivityId === activity.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ fromIndex: index, fromDayNumber: dayNumber })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateActivity(dayNumber, activity.id, { isFavorite: !activity.isFavorite });
  };

  const getDirectionsUrl = () => {
    const dest = encodeURIComponent(activity.title + (activity.address ? `, ${activity.address}` : ""));
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  };

  // Render transit card design if transit category
  if (activity.category === "transit") {
    return (
      <div className="w-full py-1">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-dashed border-white/5 rounded-xl text-left text-xs">
          <Icons.flight className="h-4 w-4 text-primary shrink-0 rotate-90" />
          <div className="flex-1">
            <p className="font-semibold text-zinc-300">{activity.title}</p>
            <p className="text-[10px] text-muted-foreground">
              {activity.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Cast properties to access Sprint 7.7 extensions
  const actExt = activity as any;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        selectActivity(activity.id);
      }}
      className="cursor-grab active:cursor-grabbing pointer-events-auto w-full text-left"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SelectionOutline isSelected={isSelected}>
          <GlassCard
            padding="sm"
            className={`group relative flex flex-col gap-2.5 bg-white/5 border-white/10 hover:border-primary/30 transition-colors shadow-sm ${
              isSelected ? "border-primary/50" : ""
            }`}
          >
            {/* Top row metadata: Time, rating, favorite */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                  {activity.time}
                </span>
                {actExt.rating && (
                  <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
                    ★ {actExt.rating}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={`h-5 w-5 rounded text-muted-foreground hover:text-amber-400 ${
                    activity.isFavorite ? "text-amber-400" : ""
                  }`}
                >
                  <Icons.star className={`h-3 w-3 ${activity.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-5 w-5 rounded text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icons.trash className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-white leading-tight">
                {activity.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {activity.description}
              </p>
            </div>

            {/* Visit Details Grid */}
            {(actExt.openingHours || actExt.visitDuration || actExt.crowdIndicator) && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-white/5 text-[10px] text-zinc-400">
                {actExt.openingHours && (
                  <div className="flex items-center gap-1">
                    <Icons.time className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">Hours: {actExt.openingHours}</span>
                  </div>
                )}
                {actExt.visitDuration && (
                  <div className="flex items-center gap-1">
                    <Icons.calendar className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Duration: {actExt.visitDuration}</span>
                  </div>
                )}
                {actExt.crowdIndicator && (
                  <div className="flex items-center gap-1 col-span-2">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      actExt.crowdIndicator === "High Crowds" ? "bg-red-400" : "bg-emerald-400"
                    }`} />
                    <span>Crowds: {actExt.crowdIndicator}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation Button */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between w-full">
              <span className="text-[10px] font-mono text-zinc-400">
                Price: {activity.cost || "Free"}
              </span>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                📍 Open in Google Maps
              </a>
            </div>
          </GlassCard>
        </SelectionOutline>
      </motion.div>
    </div>
  );
});
