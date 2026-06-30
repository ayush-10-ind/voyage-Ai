import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

export const AtmosphereMaterial = shaderMaterial(
  {
    color: new THREE.Color("#5b8cff"),
    coefficient: 0.1,
    power: 4.0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform vec3 color;
    uniform float coefficient;
    uniform float power;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel atmospheric edge glow
      float intensity = pow(coefficient - dot(normal, viewDir), power);
      
      gl_FragColor = vec4(color, intensity);
    }
  `
);

// Register with React Three Fiber
extend({ AtmosphereMaterial });

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        atmosphereMaterial: any;
      }
    }
  }
}
