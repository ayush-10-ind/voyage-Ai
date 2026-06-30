"use client";

import React, { useEffect } from "react";
import { gsap } from "gsap";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure GSAP globally
    gsap.config({
      nullTargetWarn: false, // Suppress warnings for missing targets during route transitions
    });
  }, []);

  return <>{children}</>;
}
