"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { CAMERA_PRESETS } from "../constants";
import { CameraPresetType } from "../types";
import { gsap } from "gsap";
import * as THREE from "three";

interface CameraControllerProps {
  preset?: CameraPresetType;
  customPosition?: [number, number, number];
  customTarget?: [number, number, number];
  duration?: number;
}

export function CameraController({
  preset = "hero",
  customPosition,
  customTarget,
  duration = 1.5,
}: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const config = CAMERA_PRESETS[preset];
    const targetPos = customPosition || config.position;
    const targetLookAt = customTarget || config.lookAt;

    // Animate camera position using GSAP
    gsap.to(camera.position, {
      x: targetPos[0],
      y: targetPos[1],
      z: targetPos[2],
      duration: duration,
      ease: "power3.inOut",
    });

    // Animate the lookAt target vector
    gsap.to(targetRef.current, {
      x: targetLookAt[0],
      y: targetLookAt[1],
      z: targetLookAt[2],
      duration: duration,
      ease: "power3.inOut",
    });

    // Animate FOV (Perspective Camera only)
    if (camera instanceof THREE.PerspectiveCamera) {
      gsap.to(camera, {
        fov: config.fov,
        duration: duration,
        ease: "power3.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    }
  }, [preset, customPosition, customTarget, duration, camera]);

  useFrame(() => {
    camera.lookAt(targetRef.current);
  });

  return null;
}
