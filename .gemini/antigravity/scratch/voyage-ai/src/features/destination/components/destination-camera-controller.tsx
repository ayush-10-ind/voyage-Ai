"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useDestinationStore } from "../store/use-destination-store";
import { latLongToVector3 } from "../helpers/coordinates";
import { EARTH_CONFIG } from "@/features/earth/constants";
import { gsap } from "gsap";
import * as THREE from "three";

export function DestinationCameraController() {
  const { camera } = useThree();
  const selectedDestination = useDestinationStore((state) => state.selectedDestination);

  useEffect(() => {
    if (!selectedDestination) {
      // Smoothly accelerate Earth rotation back to default speed
      gsap.to(EARTH_CONFIG, {
        rotationSpeed: 0.005,
        duration: 1.5,
        ease: "power2.out",
      });

      // Animate camera back to default hero position
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 2.0,
        ease: "power2.inOut",
      });
      return;
    }

    // 1. Calculate static 3D position of the selected destination
    const markerPos = latLongToVector3(
      selectedDestination.latitude,
      selectedDestination.longitude,
      2.02
    );

    // 2. Position camera at a distance of 4.2 units, directly in line with the marker
    const cameraTargetPos = markerPos.clone().normalize().multiplyScalar(4.2);

    // 3. Smoothly decelerate Earth rotation to a complete stop
    gsap.to(EARTH_CONFIG, {
      rotationSpeed: 0,
      duration: 1.2,
      ease: "power2.out",
    });

    // 4. Animate camera position to focus on the selected destination
    gsap.to(camera.position, {
      x: cameraTargetPos.x,
      y: cameraTargetPos.y,
      z: cameraTargetPos.z,
      duration: 2.2,
      ease: "power3.out",
    });
  }, [selectedDestination, camera]);

  return null;
}
