"use client";

import React from "react";
import { LightingPresetType } from "../types";

interface LightingPresetsProps {
  preset?: LightingPresetType;
}

export function LightingPresets({ preset = "space" }: LightingPresetsProps) {
  return (
    <>
      {preset === "day" && (
        <>
          <ambientLight intensity={0.4} />
          <hemisphereLight args={["#ffffff", "#bbbbff", 0.3]} />
          <directionalLight
            castShadow
            position={[5, 10, 5]}
            intensity={1.2}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
        </>
      )}

      {preset === "night" && (
        <>
          <ambientLight intensity={0.1} color="#111133" />
          <directionalLight
            castShadow
            position={[-5, 8, -3]}
            intensity={0.3}
            color="#aaccff"
            shadow-mapSize={[512, 512]}
          />
        </>
      )}

      {preset === "sunset" && (
        <>
          <ambientLight intensity={0.2} color="#3d1d5a" />
          <hemisphereLight args={["#ff7e5f", "#feb47b", 0.4]} />
          <directionalLight
            castShadow
            position={[8, 2, 4]}
            intensity={1.5}
            color="#ff5e36"
            shadow-mapSize={[1024, 1024]}
          />
        </>
      )}

      {preset === "studio" && (
        <>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1} name="key" />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} name="fill" />
          <directionalLight position={[0, 5, -5]} intensity={0.8} color="#ffffff" name="back" />
        </>
      )}

      {preset === "space" && (
        <>
          <ambientLight intensity={0.05} color="#0b1120" />
          <directionalLight
            castShadow
            position={[10, 5, 10]}
            intensity={2.0}
            color="#5b8cff"
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <pointLight position={[-10, -5, -10]} intensity={0.8} color="#8b5cf6" />
        </>
      )}
    </>
  );
}
