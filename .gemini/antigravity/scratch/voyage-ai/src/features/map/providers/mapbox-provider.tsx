import React from "react";
import { createRoot } from "react-dom/client";
import { MapProvider, MapWaypoint } from "./map-provider";
import { MockMapCanvas } from "../components/mock-map-canvas";
import { VoyageLogger } from "@/lib/logger";

export class MapboxProvider implements MapProvider {
  id = "mapbox";
  name = "Mapbox GL Provider";

  private token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  renderMap(
    container: HTMLDivElement,
    waypoints: MapWaypoint[],
    activeWaypointId: string | null,
    onSelectWaypoint?: (id: string) => void
  ): () => void {
    if (!this.token) {
      VoyageLogger.warn(
        "MapboxProvider",
        "NEXT_PUBLIC_MAPBOX_TOKEN is missing. Falling back to MockMapCanvas."
      );
      
      // Render our beautiful SVG map as a fallback
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
        setTimeout(() => root.unmount(), 0);
      };
    }

    VoyageLogger.info("MapboxProvider", "Initializing Mapbox GL Map...");
    
    // Create map container element
    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    container.innerHTML = "";
    container.appendChild(mapDiv);

    // Dynamically load Mapbox GL JS and CSS if they aren't loaded yet
    const cssId = "mapbox-gl-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css";
      document.head.appendChild(link);
    }

    const scriptId = "mapbox-gl-js";
    let scriptLoaded = !!window.hasOwnProperty("mapboxgl");

    const initMap = () => {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;

      mapboxgl.accessToken = this.token;

      const map = new mapboxgl.Map({
        container: mapDiv,
        style: "mapbox://styles/mapbox/dark-v11",
        center: waypoints.length > 0 ? [waypoints[0].lng, waypoints[0].lat] : [139.6503, 35.6762],
        zoom: 12,
        attributionControl: false,
      });

      // Fit map bounds to show all waypoints
      if (waypoints.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        waypoints.forEach((wp) => bounds.extend([wp.lng, wp.lat]));
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }

      // Add markers
      const markers: any[] = [];
      waypoints.forEach((wp) => {
        const el = document.createElement("div");
        el.className = `h-4 w-4 rounded-full border-2 border-white transition-all duration-300 cursor-pointer ${
          activeWaypointId === wp.id ? "bg-blue-500 scale-125" : "bg-purple-500"
        }`;
        
        el.addEventListener("click", () => {
          onSelectWaypoint?.(wp.id);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([wp.lng, wp.lat])
          .addTo(map);

        markers.push(marker);
      });

      // Cleanup on unmount
      return () => {
        map.remove();
      };
    };

    let cleanupFn = () => {};

    if (!scriptLoaded) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js";
      script.onload = () => {
        cleanupFn = initMap() || (() => {});
      };
      document.head.appendChild(script);
    } else {
      cleanupFn = initMap() || (() => {});
    }

    return () => {
      cleanupFn();
    };
  }
}
export const mapboxProvider = new MapboxProvider();
