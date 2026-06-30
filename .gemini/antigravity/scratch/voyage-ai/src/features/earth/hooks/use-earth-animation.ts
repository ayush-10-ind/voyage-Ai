import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Hook to apply premium organic animations to the Earth group.
 * Includes a gentle breathing scale oscillation, a floating position drift,
 * and a subtle camera idle orbit to make the scene feel alive.
 */
export function useEarthAnimation() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // 1. Breathing Animation: Gentle scale oscillation (0.5% scale amplitude)
      const scale = 1 + Math.sin(time * 0.5) * 0.005;
      groupRef.current.scale.set(scale, scale, scale);

      // 2. Floating Animation: Gentle vertical drifting
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.03;
    }

    // 3. Camera Idle Movement: Slow, cinematic orbital drift
    state.camera.position.x += Math.sin(time * 0.05) * 0.0004;
    state.camera.position.z += Math.cos(time * 0.05) * 0.0004;
  });

  return groupRef;
}
