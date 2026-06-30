"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { latLongToVector3 } from "../helpers/coordinates";
import { Destination } from "../types";
import { useDestinationStore } from "../store/use-destination-store";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface DestinationMarkerProps {
  destination: Destination;
  isSelected: boolean;
}

export function DestinationMarker({ destination, isSelected }: DestinationMarkerProps) {
  const markerRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const selectDestination = useDestinationStore((state) => state.selectDestination);

  // Position on a sphere slightly larger than Earth (radius 2.0)
  const position = latLongToVector3(destination.latitude, destination.longitude, 2.02);

  // Orient the marker to face outward from the center of the Earth
  useEffect(() => {
    if (markerRef.current) {
      const center = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3().subVectors(position, center).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
      markerRef.current.setRotationFromQuaternion(quaternion);
    }
  }, [position]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate the pulse ring scaling and fading
    if (pulseRef.current) {
      const cycle = (time * 1.2) % 1.0;
      const scale = 1.0 + cycle * 1.8;
      pulseRef.current.scale.set(scale, scale, 1);
      
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1.0 - cycle) * 0.7;
      }
    }
  });

  return (
    <group
      ref={markerRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        selectDestination(destination);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* 1. Core Pin (Glow Sphere) */}
      <mesh castShadow>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={isSelected ? "#8b5cf6" : "#5b8cff"} />
      </mesh>

      {/* 2. Pulse Ring (Flat ring facing outward) */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.04, 0.07, 32]} />
        <meshBasicMaterial
          color={isSelected ? "#8b5cf6" : "#5b8cff"}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. HTML Label on Hover or Selection */}
      {(hovered || isSelected) && (
        <Html distanceFactor={5} center style={{ pointerEvents: "none" }}>
          <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-bold text-white whitespace-nowrap shadow-md uppercase tracking-wider">
            {destination.name}
          </div>
        </Html>
      )}
    </group>
  );
}
