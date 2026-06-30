import { CameraPresetConfig, CameraPresetType } from "../types";

export const PERFORMANCE_CONFIGS = {
  low: {
    dpr: [0.8, 1.2] as [number, number],
    shadows: false,
    antialias: false,
  },
  medium: {
    dpr: [1, 1.5] as [number, number],
    shadows: true,
    antialias: true,
  },
  high: {
    dpr: [1, 2] as [number, number],
    shadows: true,
    antialias: true,
  },
} as const;

export const CAMERA_PRESETS: Record<CameraPresetType, CameraPresetConfig> = {
  hero: {
    position: [0, 0, 5],
    lookAt: [0, 0, 0],
    fov: 45,
  },
  orbit: {
    position: [3, 3, 5],
    lookAt: [0, 0, 0],
    fov: 50,
  },
  focus: {
    position: [0, 0, 2],
    lookAt: [0, 0, 0],
    fov: 35,
  },
  transition: {
    position: [0, 5, 10],
    lookAt: [0, 0, 0],
    fov: 45,
  },
};
