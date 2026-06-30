import React, { memo } from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { TravelMetadata } from "../types";

// Timeline Connector Line showing transit details
interface TimelineConnectorProps {
  travel?: TravelMetadata;
}

export const TimelineConnector = memo(function TimelineConnector({ travel }: TimelineConnectorProps) {
  if (!travel) {
    return <div className="w-px bg-white/10 h-5 mx-auto" />;
  }

  const getModeIcon = () => {
    switch (travel.mode) {
      case "walking":
        return <Icons.walk className="h-3.5 w-3.5 text-emerald-400" />;
      case "driving":
        return <Icons.car className="h-3.5 w-3.5 text-blue-400" />;
      case "transit":
        return <Icons.train className="h-3.5 w-3.5 text-indigo-400" />;
      case "bicycling":
        return <Icons.bike className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Icons.time className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative py-1 flex flex-col items-center justify-center w-full my-1 pointer-events-auto">
      {/* Vertical dashed line */}
      <div className="absolute top-0 bottom-0 left-[26px] w-px border-l border-dashed border-white/20" />
      
      {/* Travel Info Badge */}
      <div className="relative z-10 flex items-center gap-1.5 ml-[13px] px-2.5 py-0.5 rounded-full bg-[#0b1120]/90 border border-white/10 text-[9px] text-muted-foreground hover:border-white/20 transition-colors shadow-glass">
        {getModeIcon()}
        <span>
          <span className="font-semibold text-white/90">{travel.duration}</span> {travel.distance && `• ${travel.distance}`}
        </span>
      </div>
    </div>
  );
});

// Drop Indicator shown during dragover
export function TimelineDropIndicator() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="h-1 w-full bg-primary/40 rounded-full my-1 border border-primary/20"
    />
  );
}

// Empty State for a day with no activities
export function TimelineEmptyState() {
  return (
    <div className="py-8 px-4 text-center text-xs text-muted-foreground/50 border border-dashed border-white/5 rounded-xl flex flex-col items-center gap-2">
      <Icons.calendar className="h-6 w-6 text-muted-foreground/30" />
      <div className="space-y-0.5">
        <p className="font-semibold">No scheduled events</p>
        <p className="text-[10px]">Drag activities here or click Add Event</p>
      </div>
    </div>
  );
}

// Time Axis helper showing time markers
export function TimelineTimeAxis({ time }: { time: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold font-mono text-muted-foreground/60">
      <Icons.time className="h-3.5 w-3.5 shrink-0" />
      <span>{time}</span>
    </div>
  );
}

// Selection Outline glow wrapper
export function SelectionOutline({ children, isSelected }: { children: React.ReactNode; isSelected: boolean }) {
  return (
    <div className={cn(
      "rounded-xl transition-all duration-300",
      isSelected && "ring-2 ring-primary glow-primary"
    )}>
      {children}
    </div>
  );
}
