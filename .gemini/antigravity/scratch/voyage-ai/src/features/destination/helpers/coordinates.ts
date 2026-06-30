import * as THREE from "three";

/**
 * Converts latitude and longitude coordinates to a 3D Cartesian vector.
 *
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Radius of the sphere
 */
export function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  // Calculate 3D coordinates
  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}
