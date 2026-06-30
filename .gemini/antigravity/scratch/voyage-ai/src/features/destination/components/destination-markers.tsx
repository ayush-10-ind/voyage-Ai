"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DESTINATIONS } from "../constants";
import { DestinationMarker } from "./destination-marker";
import { useDestinationStore } from "../store/use-destination-store";
import { EARTH_CONFIG } from "@/features/earth/constants";
import * as THREE from "three";

export function DestinationMarkers() {
  const groupRef = useRef<THREE.Group>(null);
  const selectedDestination = useDestinationStore((state) => state.selectedDestination);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Synchronize the markers group rotation with the Earth globe rotation
      groupRef.current.rotation.y += EARTH_CONFIG.rotationSpeed * delta;
    }
  });

  return (
    <group ref={groupRef}>
      {DESTINATIONS.map((destination) => (
        <DestinationMarker
          key={destination.id}
          destination={destination}
          isSelected={selectedDestination?.id === destination.id}
        />
      ))}
    </group>
  );
}
