import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circle";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/5 border border-white/5 shadow-glass",
        variant === "circle" ? "rounded-full" : "rounded-xl",
        className
      )}
      {...props}
    />
  );
}
