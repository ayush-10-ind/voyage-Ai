"use client";

import React from "react";
import { DestinationSearch } from "./destination-search";
import { DestinationCard } from "./destination-card";
import { DestinationMarkers } from "./destination-markers";
import { DestinationCameraController } from "./destination-camera-controller";

/**
 * DestinationExplorerUI - Renders the HTML overlay elements of the Destination Explorer.
 * Should be placed outside the Canvas in the normal DOM layer.
 */
export function DestinationExplorerUI() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Left: Search Panel */}
      <div className="self-start mt-16 sm:mt-0">
        <DestinationSearch />
      </div>

      {/* Bottom Right: Destination Detail Card */}
      <DestinationCard />
    </div>
  );
}

/**
 * DestinationExplorer3D - Renders the 3D scene elements of the Destination Explorer.
 * MUST be placed inside the R3F <Canvas> / <SceneCanvas> component.
 */
export function DestinationExplorer3D() {
  return (
    <>
      {/* Renders the animated destination markers on the Earth */}
      <DestinationMarkers />
      
      {/* Listens to selection state and smoothly animates camera to focus destinations */}
      <DestinationCameraController />
    </>
  );
}
