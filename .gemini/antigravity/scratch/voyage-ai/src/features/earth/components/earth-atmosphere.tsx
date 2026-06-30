"use client";

import React from "react";
import "../materials/atmosphere-material";
import { EARTH_CONFIG } from "../constants";
import * as THREE from "three";

export function EarthAtmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_CONFIG.radius + 0.12, EARTH_CONFIG.widthSegments, EARTH_CONFIG.heightSegments]} />
      <atmosphereMaterial
        color={new THREE.Color("#5b8cff")}
        coefficient={0.1}
        power={4.0}
        transparent={true}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
