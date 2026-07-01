import { Activity } from "../../timeline/types";

export class TravelIntelligenceEngine {
  // Baseline coordinates for major destinations
  private static destinationCoordinates: Record<string, { lat: number; lng: number }> = {
    tokyo: { lat: 35.6762, lng: 139.6503 },
    paris: { lat: 48.8566, lng: 2.3522 },
    new_york: { lat: 40.7128, lng: -74.0060 },
    london: { lat: 51.5074, lng: -0.1278 },
    zermatt: { lat: 46.0207, lng: 7.7491 },
    reykjavik: { lat: 64.1466, lng: -21.9426 },
    ubud: { lat: -8.5069, lng: 115.2625 },
    tromso: { lat: 69.6492, lng: 18.9553 },
    bali: { lat: -8.4095, lng: 115.1889 },
  };

  /**
   * Enriches a list of activities with stable travel intelligence metadata.
   */
  static enrichActivities(
    destination: string,
    activities: Activity[]
  ): Activity[] {
    const cleanDest = destination.toLowerCase().replace(/[^a-z_]/g, "_");
    const baseCoords = this.destinationCoordinates[cleanDest] || { lat: 35.6762, lng: 139.6503 };

    return activities.map((act, idx) => {
      // 1. Generate stable offsets for coordinates so waypoints are spread out but close
      const latOffset = (Math.sin(idx * 45) * 0.02);
      const lngOffset = (Math.cos(idx * 45) * 0.02);
      const coordinates = act.coordinates || {
        lat: baseCoords.lat + latOffset,
        lng: baseCoords.lng + lngOffset,
      };

      // 2. Generate nearby POIs based on category
      let nearbyPOIs: string[] = [];
      if (act.category === "dining") {
        nearbyPOIs = ["Local Craft Brewery (2m walk)", "Traditional Sweet Shop (4m walk)"];
      } else if (act.category === "transit") {
        nearbyPOIs = ["Information Center (1m walk)", "Baggage Lockers (2m walk)"];
      } else {
        nearbyPOIs = ["Scenic Outlook (3m walk)", "Historical Marker (5m walk)"];
      }

      // 3. Generate safety and crowd metrics
      const hash = (act.title.charCodeAt(0) + idx) % 100;
      const safetyScore = 85 + (hash % 15); // 85 to 100
      const crowdLevel: "low" | "medium" | "high" = hash % 3 === 0 ? "high" : hash % 3 === 1 ? "medium" : "low";

      // 4. Generate solar times (sunrise, sunset, golden hour)
      const solarTimes = {
        sunrise: "05:48 AM",
        sunset: "06:12 PM",
        goldenHour: "05:15 PM - 06:12 PM",
      };

      // 5. Generate local events, accessibility info, and transit options
      const localEvents = hash % 2 === 0 ? ["Local Street Food Market (6:00 PM)"] : [];
      const accessibilityInfo = ["Wheelchair accessible entrance", "Assistive listening systems available"];
      const transitOptions = ["Bus Line 42 (every 10m)", "Metro Line C (every 5m)"];

      return {
        ...act,
        coordinates,
        nearbyPOIs,
        safetyScore,
        crowdLevel,
        solarTimes,
        localEvents,
        accessibilityInfo,
        transitOptions,
      };
    });
  }
}
