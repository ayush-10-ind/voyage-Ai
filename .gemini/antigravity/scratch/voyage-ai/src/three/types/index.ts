export type LightingPresetType = "day" | "night" | "sunset" | "studio" | "space";

export type CameraPresetType = "hero" | "orbit" | "focus" | "transition";

export interface CameraPresetConfig {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

export type PerformanceLevel = "low" | "medium" | "high";

export interface SceneConfig {
  antialias?: boolean;
  shadows?: boolean;
  dpr?: [number, number];
  performance?: PerformanceLevel;
}
