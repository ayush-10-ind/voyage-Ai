import * as THREE from "three";

/**
 * Optimize a Three.js object hierarchy for performance.
 * Enables frustum culling, configures shadow casting/receiving, and optimizes materials.
 */
export function optimizeSceneObject(
  object: THREE.Object3D,
  options: {
    castShadow?: boolean;
    receiveShadow?: boolean;
    frustumCulled?: boolean;
  } = {}
) {
  const { castShadow = true, receiveShadow = true, frustumCulled = true } = options;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
      child.frustumCulled = frustumCulled;

      // Optimize materials
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => optimizeMaterial(mat));
        } else {
          optimizeMaterial(child.material);
        }
      }
    }
  });
}

function optimizeMaterial(material: THREE.Material) {
  material.precision = "highp";
  
  // If the material is opaque, force depthWrite to true to allow early-z culling
  if (!material.transparent) {
    material.depthWrite = true;
  }
}
