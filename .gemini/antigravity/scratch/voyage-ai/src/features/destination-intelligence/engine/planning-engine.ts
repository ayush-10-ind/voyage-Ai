import { Attraction, DestinationKnowledge } from "../types";
import { TripPreferences } from "@/features/copilot/types";
import { VoyageLogger } from "@/lib/logger";

export class TripPlanningEngine {
  /**
   * Calculates distance in km between two coordinates using Haversine formula.
   */
  static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Ranks attractions based on user interests, style, accessibility, and popularity.
   */
  static rankAttractions(
    attractions: Attraction[],
    preferences: TripPreferences
  ): Attraction[] {
    const interests = preferences.interests || [];
    const budget = preferences.budget || "moderate";

    return [...attractions].sort((a, b) => {
      let scoreA = a.popularity || 50;
      let scoreB = b.popularity || 50;

      // 1. Add weights for user interests match
      interests.forEach(interest => {
        const keyword = interest.toLowerCase().trim();
        if (a.title.toLowerCase().includes(keyword) || a.description.toLowerCase().includes(keyword)) scoreA += 25;
        if (b.title.toLowerCase().includes(keyword) || b.description.toLowerCase().includes(keyword)) scoreB += 25;
      });

      // 2. Add weights for budget alignment
      const costA = a.cost === "Free" ? 0 : parseFloat(a.cost.replace(/[^0-9.]/g, "")) || 0;
      const costB = b.cost === "Free" ? 0 : parseFloat(b.cost.replace(/[^0-9.]/g, "")) || 0;

      if (budget === "budget") {
        scoreA += (costA === 0 ? 15 : costA < 10 ? 10 : 0);
        scoreB += (costB === 0 ? 15 : costB < 10 ? 10 : 0);
      } else if (budget === "luxury") {
        scoreA += (costA > 30 ? 15 : 0);
        scoreB += (costB > 30 ? 15 : 0);
      }

      // 3. Photography priority match
      if (a.categories.includes("photography")) scoreA += 5;
      if (b.categories.includes("photography")) scoreB += 5;

      return scoreB - scoreA;
    });
  }

  /**
   * Geographically clusters and allocates ranked attractions across D days.
   */
  static allocateAttractions(
    ranked: Attraction[],
    daysCount: number
  ): Record<number, Attraction[]> {
    const allocation: Record<number, Attraction[]> = {};
    for (let d = 1; d <= daysCount; d++) {
      allocation[d] = [];
    }

    if (ranked.length === 0) return allocation;

    // 1. Select the top N unique anchor attractions (furthest from each other) to represent each day
    const anchors: Attraction[] = [];
    const remaining = [...ranked];

    // First anchor is the highest ranked item
    if (remaining.length > 0) {
      anchors.push(remaining.shift()!);
    }

    // Pick subsequent anchors that maximize distance from existing anchors to create diverse geographical centers
    while (anchors.length < daysCount && remaining.length > 0) {
      let bestIdx = 0;
      let maxMinDist = -1;

      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        let minDist = Infinity;
        
        // Find distance to closest anchor
        for (const anchor of anchors) {
          const dist = this.getDistance(
            item.coordinates.lat, item.coordinates.lng,
            anchor.coordinates.lat, anchor.coordinates.lng
          );
          if (dist < minDist) minDist = dist;
        }

        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          bestIdx = i;
        }
      }

      anchors.push(remaining.splice(bestIdx, 1)[0]);
    }

    // Assign each anchor to a day
    anchors.forEach((anchor, idx) => {
      const dayNum = idx + 1;
      allocation[dayNum].push(anchor);
    });

    // 2. Allocate the remaining attractions to the day of the closest anchor
    remaining.forEach(item => {
      let closestDay = 1;
      let minDistance = Infinity;

      anchors.forEach((anchor, idx) => {
        const dayNum = idx + 1;
        const dist = this.getDistance(
          item.coordinates.lat, item.coordinates.lng,
          anchor.coordinates.lat, anchor.coordinates.lng
        );

        if (dist < minDistance) {
          minDistance = dist;
          closestDay = dayNum;
        }
      });

      // Avoid day overloading (max 3 sightseeing items per day to remain realistic)
      if (allocation[closestDay].length < 3) {
        allocation[closestDay].push(item);
      } else {
        // Fallback to the next closest day that isn't overloaded
        let fallbackDay = closestDay;
        let nextMinDistance = Infinity;

        anchors.forEach((anchor, idx) => {
          const dayNum = idx + 1;
          if (allocation[dayNum].length >= 3) return;

          const dist = this.getDistance(
            item.coordinates.lat, item.coordinates.lng,
            anchor.coordinates.lat, anchor.coordinates.lng
          );

          if (dist < nextMinDistance) {
            nextMinDistance = dist;
            fallbackDay = dayNum;
          }
        });

        allocation[fallbackDay].push(item);
      }
    });

    VoyageLogger.info("DestinationIntelligence", `Allocated ${ranked.length} attractions across ${daysCount} days using distance clustering.`);
    return allocation;
  }
}
