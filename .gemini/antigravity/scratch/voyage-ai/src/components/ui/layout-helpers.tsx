import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Container
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "main" | "header" | "footer";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

// Section
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  withGridBg?: boolean;
  withNoise?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, withGridBg = false, withNoise = false, ...props }, ref) => {
    return (
      <section
        className={cn(
          "py-16 md:py-24 lg:py-32 relative overflow-hidden",
          withGridBg && "bg-grid",
          withNoise && "bg-noise",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Section.displayName = "Section";

// Grid
const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    },
    gap: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    },
  },
  defaultVariants: {
    cols: 1,
    gap: "md",
  },
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => {
    return <div className={cn(gridVariants({ cols, gap, className }))} ref={ref} {...props} />;
  }
);
Grid.displayName = "Grid";

// Stack
const stackVariants = cva("flex", {
  variants: {
    direction: {
      col: "flex-col",
      row: "flex-row",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    gap: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    },
  },
  defaultVariants: {
    direction: "col",
    align: "stretch",
    justify: "start",
    gap: "sm",
  },
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, gap, ...props }, ref) => {
    return <div className={cn(stackVariants({ direction, align, justify, gap, className }))} ref={ref} {...props} />;
  }
);
Stack.displayName = "Stack";
