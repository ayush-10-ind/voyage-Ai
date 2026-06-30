import * as THREE from "three";

/**
 * Premium Glass Material configuration.
 * Apple-style physical glass with transmission, clearcoat, and roughness.
 */
export const GlassMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.1,
  metalness: 0.05,
  transmission: 0.9,
  ior: 1.5,
  thickness: 2.0,
  transparent: true,
  opacity: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.5,
});

/**
 * Premium Metal Material configuration.
 * Linear-style dark metallic surface.
 */
export const MetalMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.2,
  metalness: 0.9,
  color: new THREE.Color("#1e293b"),
});

/**
 * Glow Material configuration.
 * Uses high-emissive properties to create a neon glowing edge/surface.
 */
export const createGlowMaterial = (color = "#5b8cff") => {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    toneMapped: false, // Prevents clipping at high intensity for post-processing bloom
  });
};

/**
 * Travel Card Material configuration.
 * Translucent glassmorphism card with a purple/blue iridescent sheen.
 */
export const TravelCardMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.15,
  metalness: 0.1,
  transmission: 0.7,
  ior: 1.6,
  thickness: 1.5,
  transparent: true,
  opacity: 0.9,
  clearcoat: 1.0,
  clearcoatRoughness: 0.15,
  sheen: 1.0,
  sheenRoughness: 0.2,
  sheenColor: new THREE.Color("#8b5cf6"), // Purple sheen
  envMapIntensity: 1.2,
});

/**
 * Water Placeholder Material configuration.
 */
export const WaterMaterialPlaceholder = new THREE.MeshPhysicalMaterial({
  roughness: 0.05,
  metalness: 0.1,
  color: new THREE.Color("#0f172a"),
  transmission: 0.6,
  ior: 1.333, // Water IOR
  transparent: true,
  opacity: 0.8,
});
