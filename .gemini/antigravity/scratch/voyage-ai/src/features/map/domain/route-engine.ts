import { Activity, TravelMetadata } from "../../timeline/types";

export interface RouteSummary {
  totalDurationMin: number;
  totalDistanceKm: number;
  scenicScore: number; // 1 to 10
  carbonScoreKg: number; // CO2 emissions in kg
  modesUsed: string[];
  totalElevationGainM: number; // in meters (extension point)
  totalTrafficDelayMin: number; // in minutes (extension point)
}

export class RouteEngine {
  /**
   * Calculates route metadata (scenic score, carbon footprint, total duration/distance,
   * elevation gain, and traffic delays) for a day's activities.
   */
  static calculateRouteSummary(activities: Activity[]): RouteSummary {
    let totalDurationMin = 0;
    let totalDistanceKm = 0;
    let carbonScoreKg = 0;
    let totalElevationGainM = 0;
    let totalTrafficDelayMin = 0;
    const modes = new Set<string>();

    // 1. Accumulate travel metrics from connectors
    activities.forEach((act) => {
      if (act.travelToNext) {
        const travel = act.travelToNext;
        modes.add(travel.mode);

        // Accumulate elevation and traffic delay extension points
        totalElevationGainM += travel.elevationChange || 0;
        totalTrafficDelayMin += travel.trafficDelayMin || 0;

        // Parse duration (e.g. "15m" -> 15, "1h 10m" -> 70)
        const durationMatch = travel.duration.match(/(\d+)m/);
        const hoursMatch = travel.duration.match(/(\d+)h/);
        let mins = 0;
        if (durationMatch) mins += parseInt(durationMatch[1]);
        if (hoursMatch) mins += parseInt(hoursMatch[1]) * 60;
        totalDurationMin += mins;

        // Parse distance (e.g. "1.2 km" -> 1.2)
        if (travel.distance) {
          const dist = parseFloat(travel.distance.replace(/[^0-9.]/g, ""));
          if (!isNaN(dist)) {
            totalDistanceKm += dist;

            // Carbon emissions calculation:
            // Walking/Bicycling/Cycling: 0 CO2
            // Transit/Train/Ferry: 0.08 kg per km
            // Driving: 0.22 kg per km
            // Flight: 1.2 kg per km
            if (travel.mode === "driving") {
              carbonScoreKg += dist * 0.22;
            } else if (
              travel.mode === "transit" || 
              travel.mode === "train" || 
              travel.mode === "ferry"
            ) {
              carbonScoreKg += dist * 0.08;
            } else if (travel.mode === "flight") {
              carbonScoreKg += dist * 1.2;
            }
          }
        }
      }
    });

    // 2. Calculate Scenic Score (1 to 10)
    const sightseeingCount = activities.filter((act) => act.category === "sightseeing").length;
    const totalCount = activities.length;
    let scenicScore = 5; // Baseline
    if (totalCount > 0) {
      const ratio = sightseeingCount / totalCount;
      scenicScore = Math.min(10, Math.max(1, Math.round(5 + ratio * 5)));
    }

    return {
      totalDurationMin,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      scenicScore,
      carbonScoreKg: Math.round(carbonScoreKg * 10) / 10,
      modesUsed: Array.from(modes),
      totalElevationGainM,
      totalTrafficDelayMin,
    };
  }
}
