"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTextureLoader } from "@/three/loaders/asset-loaders";
import { EARTH_TEXTURES, EARTH_CONFIG } from "../constants";
import * as THREE from "three";

export function EarthClouds() {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudMap = useTextureLoader(EARTH_TEXTURES.clouds);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      // Rotate clouds slightly faster than the Earth for a dynamic feel
      cloudsRef.current.rotation.y += EARTH_CONFIG.cloudSpeed * delta;
      // Organic tilt drift
      cloudsRef.current.rotation.x += 0.001 * delta;
    }
  });

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[EARTH_CONFIG.radius + 0.015, EARTH_CONFIG.widthSegments, EARTH_CONFIG.heightSegments]} />
      <meshStandardMaterial
        alphaMap={cloudMap}
        map={cloudMap}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
        opacity={0.8}
        color="#ffffff"
      />
    </mesh>
  );
}
