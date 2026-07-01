import { Attraction } from "../types";
import { TripPlanningEngine } from "./planning-engine";
import { VoyageLogger } from "@/lib/logger";

export class GeographicClusterEngine {
  /**
   * Clusters attractions into D geographical districts/groups for D days.
   */
  static clusterAttractions(
    attractions: Attraction[],
    daysCount: number
  ): Record<number, Attraction[]> {
    const clusters: Record<number, Attraction[]> = {};
    for (let d = 1; d <= daysCount; d++) {
      clusters[d] = [];
    }

    if (attractions.length === 0) return clusters;

    // 1. Choose anchors (initial center points) that are as far apart as possible
    const anchors: Attraction[] = [];
    const pool = [...attractions];

    if (pool.length > 0) {
      anchors.push(pool.shift()!);
    }

    while (anchors.length < daysCount && pool.length > 0) {
      let furthestIdx = -1;
      let maxMinDist = -1;

      for (let i = 0; i < pool.length; i++) {
        const item = pool[i];
        let minDist = Infinity;

        for (const anchor of anchors) {
          const dist = TripPlanningEngine.getDistance(
            item.coordinates.lat, item.coordinates.lng,
            anchor.coordinates.lat, anchor.coordinates.lng
          );
          if (dist < minDist) minDist = dist;
        }

        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          furthestIdx = i;
        }
      }

      if (furthestIdx >= 0) {
        anchors.push(pool.splice(furthestIdx, 1)[0]);
      } else {
        break;
      }
    }

    // Initialize clusters with anchors
    anchors.forEach((anchor, idx) => {
      clusters[idx + 1].push(anchor);
    });

    // 2. Assign remaining attractions to the closest anchor's day
    pool.forEach(item => {
      let closestDay = 1;
      let minDistance = Infinity;

      anchors.forEach((anchor, idx) => {
        const dayNum = idx + 1;
        const dist = TripPlanningEngine.getDistance(
          item.coordinates.lat, item.coordinates.lng,
          anchor.coordinates.lat, anchor.coordinates.lng
        );

        if (dist < minDistance) {
          minDistance = dist;
          closestDay = dayNum;
        }
      });

      // Maintain daily limit of 3 sightseeing attractions to avoid overloading
      if (clusters[closestDay].length < 3) {
        clusters[closestDay].push(item);
      } else {
        // Fallback to the next closest day with room
        let fallbackDay = closestDay;
        let nextMinDist = Infinity;

        anchors.forEach((anchor, idx) => {
          const dayNum = idx + 1;
          if (clusters[dayNum].length >= 3) return;

          const dist = TripPlanningEngine.getDistance(
            item.coordinates.lat, item.coordinates.lng,
            anchor.coordinates.lat, anchor.coordinates.lng
          );

          if (dist < nextMinDist) {
            nextMinDist = dist;
            fallbackDay = dayNum;
          }
        });

        clusters[fallbackDay].push(item);
      }
    });

    VoyageLogger.info("DestinationIntelligence", `Geographic clustering complete. Plotted ${attractions.length} destinations into ${daysCount} districts.`);
    return clusters;
  }

  /**
   * Solves TSP using Nearest Neighbor heuristic to minimize overall walking path.
   */
  static optimizeRoute(attractions: Attraction[]): Attraction[] {
    if (attractions.length <= 1) return attractions;

    const unvisited = [...attractions];
    const path: Attraction[] = [];

    // Start with the most popular landmark
    let current = unvisited.sort((a, b) => (b.popularity || 50) - (a.popularity || 50))[0];
    const firstIdx = unvisited.indexOf(current);
    unvisited.splice(firstIdx, 1);
    path.push(current);

    while (unvisited.length > 0) {
      let closestIdx = 0;
      let minDist = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const item = unvisited[i];
        const dist = TripPlanningEngine.getDistance(
          current.coordinates.lat, current.coordinates.lng,
          item.coordinates.lat, item.coordinates.lng
        );
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }

      current = unvisited.splice(closestIdx, 1)[0];
      path.push(current);
    }

    return path;
  }
}
