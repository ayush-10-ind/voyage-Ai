"use client";

import React, { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SpaceEnvironment } from "@/three/environment/space-environment";
import { LightingPresets } from "@/three/lights/lighting-presets";
import { EarthGlobe } from "./earth-globe";
import { EarthClouds } from "./earth-clouds";
import { EarthAtmosphere } from "./earth-atmosphere";
import { useEarthAnimation } from "../hooks/use-earth-animation";
import { gsap } from "gsap";

interface InteractiveEarthProps {
  onIntroComplete?: () => void;
}

export function InteractiveEarth({ onIntroComplete }: InteractiveEarthProps) {
  const earthGroupRef = useEarthAnimation();
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    // Set camera far away initially
    camera.position.set(0, 0, 12);
    
    // Smooth cinematic zoom-in on mount
    gsap.to(camera.position, {
      z: 5,
      duration: 3.5,
      ease: "power2.out",
      onComplete: () => {
        setControlsEnabled(true);
        if (onIntroComplete) onIntroComplete();
      },
    });
  }, [camera, onIntroComplete]);

  return (
    <>
      {/* Space Lighting Preset (optimized directional sun + ambient fill) */}
      <LightingPresets preset="space" />

      {/* Space Environment (dynamic starfield + atmospheric depth fog) */}
      <SpaceEnvironment showStars={true} showSky={false} />

      {/* Premium Orbit Controls, enabled only after intro zoom completes */}
      <OrbitControls
        enabled={controlsEnabled}
        enableZoom={true}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={3.5}   // Prevent zooming into the atmosphere
        maxDistance={7.5}   // Prevent zooming too far away
        maxPolarAngle={Math.PI / 2 + 0.25} // Restrict vertical tilt for cinematic framing
        minPolarAngle={Math.PI / 2 - 0.25}
      />

      {/* Animated Earth Group containing the Globe, Clouds, and Atmosphere */}
      <group ref={earthGroupRef}>
        <EarthGlobe />
        <EarthClouds />
        <EarthAtmosphere />
      </group>
    </>
  );
}
