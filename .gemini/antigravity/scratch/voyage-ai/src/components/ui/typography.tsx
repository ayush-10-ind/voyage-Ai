import * as React from "react";
   import { cva, type VariantProps } from "class-variance-authority";
   import { cn } from "@/lib/utils";

   const typographyVariants = cva("text-foreground font-sans", {
     variants: {
       variant: {
         display: "font-heading text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-gradient bg-clip-text",
         headline: "font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
         title: "font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl",
         subtitle: "text-lg text-muted-foreground sm:text-xl md:text-2xl font-light leading-relaxed",
         body: "text-base leading-relaxed text-muted-foreground/90",
         caption: "text-xs font-medium text-muted-foreground/80 tracking-wider uppercase",
         code: "font-mono text-sm bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-secondary",
       },
     },
     defaultVariants: {
       variant: "body",
     },
   });

   export interface TypographyProps
     extends React.HTMLAttributes<HTMLElement>,
       VariantProps<typeof typographyVariants> {
     as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "code" | "div";
   }

   const Typography = React.forwardRef<HTMLElement, TypographyProps>(
     ({ className, variant, as, ...props }, ref) => {
       const Component =
         as ||
         (variant === "display"
           ? "h1"
           : variant === "headline"
             ? "h2"
             : variant === "title"
               ? "h3"
               : variant === "subtitle"
                 ? "p"
                 : variant === "code"
                   ? "code"
                   : "p");
       return (
         <Component
           className={cn(typographyVariants({ variant, className }))}
           ref={ref as any}
           {...props}
         />
       );
     }
   );
   Typography.displayName = "Typography";

   export { Typography, typographyVariants };
   
