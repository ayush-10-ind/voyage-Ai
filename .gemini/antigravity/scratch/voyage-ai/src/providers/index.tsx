"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { MotionProvider } from "./motion-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
          <Toaster position="bottom-right" closeButton richColors theme="dark" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
