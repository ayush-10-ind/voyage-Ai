"use client";

import React from "react";
import { Stars, Sky, Environment } from "@react-three/drei";

interface SpaceEnvironmentProps {
  showStars?: boolean;
  showSky?: boolean;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  hdriPreset?: "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";
}

export function SpaceEnvironment({
  showStars = true,
  showSky = false,
  fogColor = "#050816",
  fogNear = 5,
  fogFar = 25,
  hdriPreset,
}: SpaceEnvironmentProps) {
  return (
    <>
      {/* Fog for depth blending */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* Premium Stars component */}
      {showStars && (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />
      )}

      {/* Dynamic Sky */}
      {showSky && (
        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />
      )}

      {/* HDRI environment lighting */}
      {hdriPreset && (
        <Environment preset={hdriPreset} />
      )}
    </>
  );
}
