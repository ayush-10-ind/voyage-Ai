"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTextureLoader } from "@/three/loaders/asset-loaders";
import { EARTH_TEXTURES, EARTH_CONFIG } from "../constants";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// Define the custom Earth shader material for real-time day/night transition
const EarthShaderMaterial = shaderMaterial(
  {
    dayMap: null as THREE.Texture | null,
    nightMap: null as THREE.Texture | null,
    normalMap: null as THREE.Texture | null,
    uSunDirection: new THREE.Vector3(10, 3, 5).normalize(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    void main() {
      vUv = uv;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform sampler2D normalMap;
    uniform vec3 uSunDirection;
    void main() {
      vec3 dayColor = texture2D(dayMap, vUv).rgb;
      vec3 nightColor = texture2D(nightMap, vUv).rgb;
      
      // Perturb normal using the topology map as a bump map
      vec3 bump = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
      vec3 normal = normalize(vWorldNormal + bump * 0.05);
      
      vec3 sunDir = normalize(uSunDirection);
      float sunIntensity = dot(normal, sunDir);
      
      // Smooth transition between day and night (terminator line)
      float blend = smoothstep(-0.2, 0.2, sunIntensity);
      
      // Make night lights pop
      vec3 nightLights = nightColor * 2.5;
      
      // Blend day and night textures
      vec3 baseColor = mix(nightLights, dayColor, blend);
      
      // Apply diffuse lighting on the day side with subtle ambient light on the night side
      float diffuse = max(0.08, blend);
      
      gl_FragColor = vec4(baseColor * diffuse, 1.0);
    }
  `
);

// Register with React Three Fiber
extend({ EarthShaderMaterial });

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        earthShaderMaterial: any;
      }
    }
  }
}

export function EarthGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);

  // Load textures lazily using custom cached loaders
  const dayMap = useTextureLoader(EARTH_TEXTURES.day);
  const nightMap = useTextureLoader(EARTH_TEXTURES.night);
  const normalMap = useTextureLoader(EARTH_TEXTURES.topology);

  // Slowly rotate the Earth globe
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += EARTH_CONFIG.rotationSpeed * delta;
    }
  });

  return (
    <mesh ref={globeRef} castShadow receiveShadow>
      <sphereGeometry args={[EARTH_CONFIG.radius, EARTH_CONFIG.widthSegments, EARTH_CONFIG.heightSegments]} />
      <earthShaderMaterial
        dayMap={dayMap}
        nightMap={nightMap}
        normalMap={normalMap}
        uSunDirection={new THREE.Vector3(10, 3, 5).normalize()}
      />
    </mesh>
  );
}
