"use client";

import { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Reusable GLTF Model Loader with preloading capabilities.
 */
export function useModelLoader(url: string) {
  const gltf = useGLTF(url);
  return gltf;
}

useModelLoader.preload = (url: string) => {
  useGLTF.preload(url);
};

useModelLoader.clear = (url: string) => {
  useGLTF.clear(url);
};

/**
 * Generates a beautiful procedural canvas texture as an offline/instant fallback.
 */
function createProceduralTexture(url: string): THREE.Texture {
  if (typeof window === "undefined") {
    return new THREE.Texture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  if (url.includes("earth-blue-marble")) {
    // Day Map: Deep blue oceans with green/brown stylized continents
    ctx.fillStyle = "#0b192c"; // Ocean base
    ctx.fillRect(0, 0, 512, 256);
    
    // Stylized continent shapes
    ctx.fillStyle = "#1b4d3e"; // Land
    
    // Americas
    ctx.beginPath();
    ctx.arc(140, 110, 45, 0, Math.PI * 2);
    ctx.arc(120, 70, 35, 0, Math.PI * 2);
    ctx.arc(160, 160, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Eurasia / Africa
    ctx.beginPath();
    ctx.arc(360, 80, 55, 0, Math.PI * 2);
    ctx.arc(320, 130, 40, 0, Math.PI * 2);
    ctx.arc(420, 150, 25, 0, Math.PI * 2);
    ctx.arc(430, 90, 20, 0, Math.PI * 2);
    ctx.fill();
  } else if (url.includes("earth-night")) {
    // Night Map: Dark space blue with glowing gold/yellow city lights
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, 512, 256);
    
    // Draw glowing city light clusters on landmass areas
    const drawCity = (x: number, y: number, r: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(250, 204, 21, 0.8)");
      grad.addColorStop(0.3, "rgba(250, 204, 21, 0.3)");
      grad.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    
    drawCity(135, 95, 12);
    drawCity(120, 65, 8);
    drawCity(340, 100, 15);
    drawCity(360, 70, 20);
    drawCity(415, 130, 10);
  } else if (url.includes("earth-topology")) {
    // Topology: Solid neutral gray bump map
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 256);
  } else if (url.includes("earth-clouds")) {
    // Clouds: Transparent canvas with soft white wispy cloud patterns
    ctx.clearRect(0, 0, 512, 256);
    
    // Draw soft white cloud bands
    const drawCloud = (x: number, y: number, rx: number, ry: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      grad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCloud(100, 80, 80, 30);
    drawCloud(280, 120, 120, 45);
    drawCloud(400, 60, 90, 35);
    drawCloud(200, 190, 100, 40);
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 512, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Robust Texture Loader with instant offline procedural fallbacks.
 * Prevents application crashes and enables instant First Contentful Paint.
 */
export function useTextureLoader(url: string): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(() => createProceduralTexture(url));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loader = new THREE.TextureLoader();
    
    // Enable cross-origin loading
    loader.setCrossOrigin("anonymous");

    loader.load(
      url,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.generateMipmaps = true;
        loadedTexture.anisotropy = 8;
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.warn(
          `[TextureLoader] Failed to load remote texture from "${url}". Keeping procedural fallback.`,
          err
        );
      }
    );
  }, [url]);

  return texture;
}
export default useTextureLoader;
