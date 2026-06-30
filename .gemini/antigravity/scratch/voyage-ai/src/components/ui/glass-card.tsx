import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "glass rounded-xl overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        hoverLift: "glass-hover",
        glowPrimary: "glow-primary border-glow",
        glowSecondary: "glow-secondary border-glow",
        muffled: "glass-muffled",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        className={cn(glassCardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

// Stat Card
export interface StatCardProps extends GlassCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    type: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, trend, icon, className, ...props }, ref) => {
    return (
      <GlassCard
        className={cn("flex flex-col gap-2 relative overflow-hidden", className)}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase">
            {title}
          </span>
          {icon && <div className="text-primary h-5 w-5 flex items-center justify-center">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                trend.type === "up" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                trend.type === "down" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                trend.type === "neutral" && "bg-white/5 text-muted-foreground border border-white/10"
              )}
            >
              {trend.type === "up" ? "↑" : trend.type === "down" ? "↓" : "•"} {trend.value}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-normal mt-1">
            {description}
          </p>
        )}
      </GlassCard>
    );
  }
);
StatCard.displayName = "StatCard";

// Feature Card
export interface FeatureCardProps extends GlassCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, badge, className, ...props }, ref) => {
    return (
      <GlassCard
        className={cn("flex flex-col gap-4 group", className)}
        ref={ref}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300 text-primary">
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold font-heading tracking-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </GlassCard>
    );
  }
);
FeatureCard.displayName = "FeatureCard";
