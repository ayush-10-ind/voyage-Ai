import { useState } from "react";
import { useThree } from "@react-three/fiber";
import { usePerformanceMonitor } from "@react-three/drei";

/**
 * Access the core Three.js scene, renderer, and camera.
 */
export function useThreeScene() {
  const { scene, gl, camera, size } = useThree();
  return { scene, gl, camera, size };
}

/**
 * Access responsive viewport sizes in 3D world units.
 */
export function useViewport() {
  const { viewport } = useThree();
  return viewport;
}

/**
 * Hook to react to real-time rendering performance changes.
 * Returns a performance factor between 0.0 (poor) and 1.0 (excellent).
 */
export function usePerformance(): number {
  const [factor, setFactor] = useState(1.0);

  try {
    // Subscribes to the Canvas PerformanceMonitor via callbacks
    usePerformanceMonitor({
      onChange: (api) => setFactor(api.factor),
    });
  } catch {
    // Fallback if hook is called outside Canvas / PerformanceMonitor context
  }

  return factor;
}
