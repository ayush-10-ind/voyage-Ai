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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        selectActivity(activity.id);
      }}
      className="cursor-grab active:cursor-grabbing pointer-events-auto w-full"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SelectionOutline isSelected={isSelected}>
          <GlassCard
            padding="sm"
            className={`group relative flex items-start gap-2.5 bg-white/5 border-white/10 hover:border-primary/30 transition-colors shadow-sm ${
              isSelected ? "border-primary/50" : ""
            }`}
          >
            {/* Drag Handle Icon on Left */}
            <div className="mt-1 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors cursor-grab">
              <Icons.filter className="h-3.5 w-3.5 rotate-90" />
            </div>

            {/* Content */}
            <div className="flex-1 text-left space-y-1 pr-12">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                  {activity.time}
                </span>
                {activity.cost && (
                  <span className="text-[9px] font-mono text-muted-foreground font-semibold flex items-center gap-1">
                    {activity.cost}
                    {activity.plannedCost !== undefined && activity.plannedCost > 0 && (
                      <span className="flex items-center gap-1 font-sans">
                        •
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          activity.paymentStatus === "paid"
                            ? "bg-emerald-400 shadow-glow"
                            : activity.paymentStatus === "partially_paid"
                              ? "bg-amber-400"
                              : "bg-white/25"
                        }`} />
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                          {activity.paymentStatus === "paid" ? "Paid" : activity.paymentStatus === "partially_paid" ? "Part" : "Unpaid"}
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white leading-tight">
                {activity.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {activity.description}
              </p>
            </div>

            {/* Actions */}
            <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className={`h-6 w-6 rounded-md text-muted-foreground hover:text-amber-400 ${
                  activity.isFavorite ? "text-amber-400" : ""
                }`}
              >
                <Icons.star className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <Icons.edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              >
                <Icons.trash className="h-3 w-3" />
              </Button>
            </div>
          </GlassCard>
        </SelectionOutline>
      </motion.div>
    </div>
  );
});
