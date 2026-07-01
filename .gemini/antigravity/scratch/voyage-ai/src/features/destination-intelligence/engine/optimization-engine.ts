import { Attraction, DestinationKnowledge } from "../types";
import { ProviderWeather } from "../providers/interfaces";
import { TripPlanningEngine } from "./planning-engine";
import { VoyageLogger } from "@/lib/logger";

export interface ScheduledActivity {
  time: string;
  title: string;
  description: string;
  cost: string;
  category: "sightseeing" | "dining" | "transit" | "other";
  coordinates?: { lat: number; lng: number };
}

export class TripOptimizationEngine {
  /**
   * Optimizes a day's schedule of attractions based on weather, opening hours, and transit.
   */
  static optimizeDay(
    dayNumber: number,
    attractions: Attraction[],
    knowledge: DestinationKnowledge,
    weather: ProviderWeather
  ): ScheduledActivity[] {
    VoyageLogger.info("DestinationIntelligence", `Optimizing Day ${dayNumber} - Weather: ${weather.condition}`);

    let processedAttractions = [...attractions];

    // 1. Weather-aware rescheduling: Swap outdoor high-weather-dependency activities for indoor ones if it is rainy/snowy
    if (weather.condition === "rainy" || weather.condition === "snowy") {
      processedAttractions = processedAttractions.map(attraction => {
        if (attraction.weatherDependency === "high") {
          // Find an alternative indoor museum or attraction that is not already scheduled
          const indoorAlternative = knowledge.hiddenGems
            .concat(knowledge.mustVisitAttractions)
            .find(alt => 
              alt.weatherDependency === "low" && 
              alt.title !== attraction.title &&
              !processedAttractions.some(p => p.title === alt.title)
            );

          if (indoorAlternative) {
            VoyageLogger.info(
              "DestinationIntelligence", 
              `Weather Swap: Swapped outdoor "${attraction.title}" for indoor "${indoorAlternative.title}" due to ${weather.condition} forecast.`
            );
            return indoorAlternative;
          }
        }
        return attraction;
      });
    }

    // 2. Sort chronologically by preferred bestTimeOfDay
    const timePriority = {
      sunrise: 0,
      morning: 1,
      afternoon: 2,
      sunset: 3,
      night: 4
    };

    processedAttractions.sort((a, b) => timePriority[a.bestTimeOfDay] - timePriority[b.bestTimeOfDay]);

    // 3. Construct chronological schedule with transit recommendations
    const schedule: ScheduledActivity[] = [];
    const timeSlots = ["09:00 AM", "01:30 PM", "04:30 PM"];

    processedAttractions.forEach((att, idx) => {
      const time = att.bestTimeOfDay === "sunrise" 
        ? "06:00 AM" 
        : att.bestTimeOfDay === "night" 
          ? "08:30 PM" 
          : timeSlots[idx % timeSlots.length];

      schedule.push({
        time,
        title: att.title,
        description: att.description,
        cost: att.cost,
        category: "sightseeing",
        coordinates: att.coordinates
      });

      // If there is a next activity, calculate distance and append a Transit Recommendation
      if (idx < processedAttractions.length - 1) {
        const nextAtt = processedAttractions[idx + 1];
        const dist = TripPlanningEngine.getDistance(
          att.coordinates.lat, att.coordinates.lng,
          nextAtt.coordinates.lat, nextAtt.coordinates.lng
        );

        let recMode: "walking" | "transit" | "driving" = "walking";
        let duration = "10m";
        let summary = "via local paths";

        if (dist < 1.2) {
          recMode = "walking";
          duration = `${Math.round(dist * 12) + 5}m`;
          summary = "via walking shortcuts";
        } else if (dist < 8.0) {
          recMode = "transit";
          duration = `${Math.round(dist * 3) + 10}m`;
          summary = `via city public ${knowledge.transportation[0] || "transit"}`;
        } else {
          recMode = "driving";
          duration = `${Math.round(dist * 2) + 8}m`;
          summary = "via highway / taxi cab";
        }

        const transitTime = att.bestTimeOfDay === "sunrise" ? "08:30 AM" : "12:30 PM";

        schedule.push({
          time: transitTime,
          title: `Transit: ${recMode.charAt(0).toUpperCase() + recMode.slice(1)} to ${nextAtt.title}`,
          description: `Distance: ${dist.toFixed(1)} km. Recommended travel mode: ${recMode} (${duration} travel time) ${summary}.`,
          cost: recMode === "walking" ? "Free" : "$3",
          category: "transit"
        });
      }
    });

    return schedule;
  }
}
