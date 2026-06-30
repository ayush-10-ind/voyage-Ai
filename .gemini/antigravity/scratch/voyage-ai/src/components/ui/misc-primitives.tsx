import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Spinner
const spinnerVariants = cva("animate-spin rounded-full border-t-transparent", {
  variants: {
    variant: {
      default: "border-2 border-primary",
      secondary: "border-2 border-secondary",
      muted: "border-2 border-muted-foreground/30",
      white: "border-2 border-white",
    },
    size: {
      xs: "h-3 w-3 border-2",
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-[3px]",
      xl: "h-12 w-12 border-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <div className={cn(spinnerVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Spinner.displayName = "Spinner";

// Divider
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  text?: string;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", text, ...props }, ref) => {
    if (orientation === "vertical") {
      return <div className={cn("w-px bg-white/10 h-full self-stretch", className)} ref={ref} {...props} />;
    }

    return (
      <div className={cn("w-full flex items-center gap-4", className)} ref={ref} {...props}>
        <div className="h-px bg-white/10 flex-1" />
        {text && <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{text}</span>}
        {text && <div className="h-px bg-white/10 flex-1" />}
      </div>
    );
  }
);
Divider.displayName = "Divider";

// IconWrapper
const iconWrapperVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20",
        primary: "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20",
        secondary: "bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
      },
      size: {
        xs: "p-1 h-6 w-6 text-xs",
        sm: "p-1.5 h-8 w-8 text-sm",
        md: "p-2 h-10 w-10 text-base",
        lg: "p-2.5 h-12 w-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof iconWrapperVariants> {
  children: React.ReactNode;
}

export const IconWrapper = React.forwardRef<HTMLDivElement, IconWrapperProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div className={cn(iconWrapperVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
IconWrapper.displayName = "IconWrapper";

// Chip / Pill
const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all duration-200 cursor-default",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-white/10 text-foreground hover:bg-white/10",
        primary: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20",
        secondary: "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        destructive: "bg-red-500/10 border-red-500/20 text-red-400",
      },
      interactive: {
        true: "cursor-pointer active:scale-95",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chipVariants> {
  onRemove?: () => void;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, interactive, onRemove, children, ...props }, ref) => {
    return (
      <div className={cn(chipVariants({ variant, interactive, className }))} ref={ref} {...props}>
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-full p-0.5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors ml-1 leading-none"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";
