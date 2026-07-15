import React, { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "../types";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useTimelineStore } from "../store/use-timeline-store";
import { SelectionOutline } from "./timeline-elements";
import { placePhotoProvider } from "@/features/destination-intelligence/providers/photo-provider";

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
  const { selectedActivityId, selectActivity, updateActivity, trip } = useTimelineStore();
  const isSelected = selectedActivityId === activity.id;
  const [thumbUrl, setThumbUrl] = useState<string>("");

  useEffect(() => {
    if (activity.category === "transit" || !trip) return;
    
    // Resolve dynamic place image for thumbnail card
    placePhotoProvider.getImages(activity.title, trip.destination)
      .then(urls => {
        if (urls && urls.length > 0) {
          setThumbUrl(urls[0]);
        }
      })
      .catch(() => {
        if (activity.images && activity.images.length > 0) {
          setThumbUrl(activity.images[0]);
        }
      });
  }, [activity.title, activity.category, activity.images, trip?.destination]);

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
    const isMetro = activity.title.toLowerCase().includes("metro") || activity.description.toLowerCase().includes("metro") || activity.description.toLowerCase().includes("transit");
    const isDrive = activity.title.toLowerCase().includes("taxi") || activity.title.toLowerCase().includes("driving") || activity.description.toLowerCase().includes("taxi") || activity.description.toLowerCase().includes("car");
    
    return (
      <div className="w-full py-1 flex items-center justify-between pointer-events-none pl-3">
        <div className="flex flex-col items-center mr-3 shrink-0">
          <div className="h-3 w-px bg-white/15" />
          <div className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center bg-[#070b19] shadow-sm">
            {isMetro ? (
              <Icons.train className="h-3.5 w-3.5 text-indigo-400" />
            ) : isDrive ? (
              <Icons.car className="h-3.5 w-3.5 text-blue-400" />
            ) : (
              <Icons.walk className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>
          <div className="h-3 w-px bg-white/15" />
        </div>
        <div className="flex-1 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-left overflow-hidden">
          <span className="text-[10px] font-bold text-zinc-300 block">{activity.title}</span>
          <span className="text-[9px] text-zinc-500 block truncate">{activity.description}</span>
        </div>
      </div>
    );
  }

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
            className={`group relative flex flex-col gap-2 bg-[#0b1120]/80 border-white/10 hover:border-primary/30 transition-colors shadow-sm ${
              isSelected ? "border-primary/50" : ""
            }`}
          >
            {/* Top row metadata: Time, rating, favorite */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                  {activity.time}
                </span>
                {activity.googleRating && (
                  <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
                    ★ {activity.googleRating.toFixed(1)} 
                    <span className="text-zinc-500 font-normal">({activity.googleReviewsCount?.toLocaleString()})</span>
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

            {/* Layout with Image Thumbnail on Left, Title details on Right */}
            <div className="flex gap-2.5 items-start">
              {thumbUrl && (
                <div className="h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-white/5 relative border border-white/5">
                  <img 
                    src={thumbUrl} 
                    alt="Place Preview" 
                    loading="lazy" 
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
              )}
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {activity.title}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                  {activity.description}
                </p>
              </div>
            </div>

            {/* Visit Details Grid */}
            {(activity.openingHours || activity.visitDuration || activity.crowdIndicator) && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-white/5 text-[9px] text-zinc-400">
                {activity.openingHours && (
                  <div className="flex items-center gap-1">
                    <Icons.time className="h-2.5 w-2.5 text-primary shrink-0" />
                    <span className="truncate">Hours: {activity.openingHours}</span>
                  </div>
                )}
                {activity.visitDuration && (
                  <div className="flex items-center gap-1">
                    <Icons.calendar className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                    <span>Duration: {activity.visitDuration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation Button */}
            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between w-full text-[9px]">
              <span className="font-mono text-zinc-400">
                Price: {activity.cost || "Free"}
              </span>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                📍 Get Directions
              </a>
            </div>
          </GlassCard>
        </SelectionOutline>
      </motion.div>
    </div>
  );
});
