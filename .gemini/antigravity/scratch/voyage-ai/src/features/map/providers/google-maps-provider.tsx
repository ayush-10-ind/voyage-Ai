import React from "react";
import { createRoot } from "react-dom/client";
import { MapProvider, MapWaypoint } from "./map-provider";
import { MockMapCanvas } from "../components/mock-map-canvas";
import { VoyageLogger } from "@/lib/logger";

let isLoaded = false;
let callbacks: Array<() => void> = [];

function loadGoogleMapsScript(callback: () => void) {
  if (isLoaded) {
    callback();
    return;
  }
  callbacks.push(callback);
  if (callbacks.length > 1) return;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!key) {
    // Invoke immediately to trigger fallback
    callback();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isLoaded = true;
    callbacks.forEach((cb) => cb());
    callbacks = [];
  };
  script.onerror = () => {
    VoyageLogger.warn("GoogleMapsProvider", "Failed to load Google Maps script. Falling back to vector canvas.");
    callbacks = [];
  };
  document.head.appendChild(script);
}

export class GoogleMapsProvider implements MapProvider {
  id = "google-maps";
  name = "Google Maps JS Provider";

  renderMap(
    container: HTMLDivElement,
    waypoints: MapWaypoint[],
    activeWaypointId: string | null,
    onSelectWaypoint?: (id: string) => void
  ): () => void {
    let mapInstance: any = null;
    let markersMap: Record<string, any> = {};
    let polylineRoute: any = null;
    let fallbackRoot: any = null;

    const cleanup = () => {
      if (polylineRoute) {
        polylineRoute.setMap(null);
      }
      Object.values(markersMap).forEach((m: any) => m.setMap(null));
      markersMap = {};
      if (fallbackRoot) {
        try {
          fallbackRoot.unmount();
        } catch (e) {}
      }
    };

    loadGoogleMapsScript(() => {
      const google = (window as any).google;
      if (!google || !google.maps) {
        VoyageLogger.warn(
          "GoogleMapsProvider",
          "Google Maps API is not loaded. Rendering vector map fallback."
        );
        container.innerHTML = "";
        fallbackRoot = createRoot(container);
        fallbackRoot.render(
          <MockMapCanvas
            waypoints={waypoints}
            activeWaypointId={activeWaypointId}
            onSelectWaypoint={onSelectWaypoint}
          />
        );
        return;
      }

      VoyageLogger.info("GoogleMapsProvider", "Initializing Google Maps JS API...");
      container.innerHTML = "";

      const mapDiv = document.createElement("div");
      mapDiv.style.width = "100%";
      mapDiv.style.height = "100%";
      container.appendChild(mapDiv);

      // Dark Mode styles
      const darkMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#070b19" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#070b19" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#222d4a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#02040a" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c2c54" }] }
      ];

      const centerCoord = waypoints.length > 0 
        ? { lat: waypoints[0].lat, lng: waypoints[0].lng } 
        : { lat: 35.6762, lng: 139.6503 };

      mapInstance = new google.maps.Map(mapDiv, {
        zoom: 13,
        center: centerCoord,
        styles: darkMapStyle,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true
      });

      // Inject traffic, transit, and bicycle layers
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstance);

      // Render markers
      waypoints.forEach((wp, idx) => {
        // Categorized marker colors
        const color = wp.category === "dining" ? "#f97316" : wp.category === "transit" ? "#22c55e" : "#3b82f6";
        
        const marker = new google.maps.Marker({
          position: { lat: wp.lat, lng: wp.lng },
          map: mapInstance,
          title: wp.title,
          label: {
            text: String(wp.sequence),
            color: "#ffffff",
            fontWeight: "bold"
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1.0,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 14
          }
        });

        marker.addListener("click", () => {
          onSelectWaypoint?.(wp.id);
        });

        markersMap[wp.id] = marker;

        // Open InfoWindow on hover
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="color:#000000;font-family:sans-serif;font-size:11px;padding:2px;">
            <strong>${wp.title}</strong><br/>
            Time: ${wp.time || "N/A"}<br/>
            Category: ${wp.category || "Sightseeing"}
          </div>`
        });

        marker.addListener("mouseover", () => {
          infoWindow.open(mapInstance, marker);
        });
        marker.addListener("mouseout", () => {
          infoWindow.close();
        });
      });

      // Fit map bounds to show all waypoints
      if (waypoints.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        waypoints.forEach(wp => bounds.extend({ lat: wp.lat, lng: wp.lng }));
        mapInstance.fitBounds(bounds);
        
        // Draw route polyline
        const pathCoords = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
        polylineRoute = new google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: mapInstance
        });
      }

      // Live location marker
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          new google.maps.Marker({
            position: userPos,
            map: mapInstance,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#10b981",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff"
            }
          });
        });
      }

      // Dynamic highlight animation when activeWaypointId changes
      if (activeWaypointId && markersMap[activeWaypointId]) {
        const activeMarker = markersMap[activeWaypointId];
        mapInstance.panTo(activeMarker.getPosition());
        activeMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => activeMarker.setAnimation(null), 1400);
      }
    });

    return cleanup;
  }
}

export const googleMapsProvider = new GoogleMapsProvider();
