"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { PERFORMANCE_CONFIGS } from "../constants";
import { PerformanceLevel } from "../types";
import * as THREE from "three";

interface SceneCanvasProps {
  children: React.ReactNode;
  performance?: PerformanceLevel;
  shadows?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

export function SceneCanvas({
  children,
  performance = "medium",
  shadows,
  className,
  fallback = null,
}: SceneCanvasProps) {
  const config = PERFORMANCE_CONFIGS[performance];
  const enableShadows = shadows ?? config.shadows;

  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Suspense fallback={fallback}>
        <Canvas
          gl={{
            antialias: config.antialias,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          shadows={enableShadows ? "soft" : false}
          dpr={config.dpr}
          camera={{ fov: 45, near: 0.1, far: 100 }}
        >
          {/* Performance Optimization Elements */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <PerformanceMonitor
            onChange={({ factor }) => {
              // Can hook into dynamic detail adjustment in child components
            }}
          />

          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
