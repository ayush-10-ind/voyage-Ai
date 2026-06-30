import React from "react";
import { createRoot } from "react-dom/client";
import { MapProvider, MapWaypoint } from "./map-provider";
import { MockMapCanvas } from "../components/mock-map-canvas";

export class MockMapProvider implements MapProvider {
  id = "mock-vector";
  name = "Voyage Vector Map (Simulated)";

  renderMap(
    container: HTMLDivElement,
    waypoints: MapWaypoint[],
    activeWaypointId: string | null,
    onSelectWaypoint?: (id: string) => void
  ): () => void {
    // Clear any previous content
    container.innerHTML = "";

    const root = createRoot(container);
    
    root.render(
      <MockMapCanvas
        waypoints={waypoints}
        activeWaypointId={activeWaypointId}
        onSelectWaypoint={onSelectWaypoint}
      />
    );

    return () => {
      // Unmount React tree on cleanup
      setTimeout(() => root.unmount(), 0);
    };
  }
}
