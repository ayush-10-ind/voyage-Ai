import React, { useEffect, useRef } from "react";
import { MapProvider, MapWaypoint } from "../providers/map-provider";
import { MockMapProvider } from "../providers/mock-map-provider";
import { VoyageLogger } from "@/lib/logger";

interface MapContainerProps {
  waypoints: MapWaypoint[];
  activeWaypointId: string | null;
  onSelectWaypoint?: (id: string) => void;
  provider?: MapProvider; // Allows injecting MapboxProvider or OpenStreetMapProvider
}

export function MapContainer({
  waypoints,
  activeWaypointId,
  onSelectWaypoint,
  provider = new MockMapProvider(), // Default to our premium vector mock map
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    VoyageLogger.info("Navigation", "Transition: Travel Brain → Map (Loading Map Waypoints)");

    // Delegate rendering to the Map Provider
    const cleanup = provider.renderMap(
      container,
      waypoints,
      activeWaypointId,
      onSelectWaypoint
    );

    return () => {
      // Clean up the provider instance when waypoints, active node, or provider changes
      cleanup();
    };
  }, [waypoints, activeWaypointId, onSelectWaypoint, provider]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-glass"
      style={{ minHeight: "350px" }}
    />
  );
}
