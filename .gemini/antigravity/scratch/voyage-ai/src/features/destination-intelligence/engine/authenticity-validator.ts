import { TripItinerary } from "@/features/copilot/types";
import { AUTHENTIC_DESTINATIONS, AUTHENTIC_HOTELS } from "../data/authentic-destinations";
import { VoyageLogger } from "@/lib/logger";

export class ItineraryAuthenticityValidator {
  /**
   * Validates the generated itinerary for real-world authenticity.
   * Returns true if 100% valid, false if regeneration of a component is needed.
   */
  static validate(itinerary: TripItinerary, destination: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const key = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const authDest = AUTHENTIC_DESTINATIONS[key] || AUTHENTIC_DESTINATIONS["tokyo"];

    const validAttractionNames = new Set(
      (authDest.mustVisitAttractions || [])
        .concat(authDest.hiddenGems || [])
        .map(a => a.title.toLowerCase().trim())
    );

    const validHotelNames = new Set(
      (AUTHENTIC_HOTELS[key] || AUTHENTIC_HOTELS["tokyo"])
        .map(h => h.name.toLowerCase().trim())
    );

    // Validate activities
    const seenAttractions = new Set<string>();

    itinerary.days.forEach((day, dIdx) => {
      day.activities.forEach((act: any, aIdx: number) => {
        if (act.category === "transit") return;

        const titleLower = act.title.toLowerCase().trim();

        // 1. Check for duplicate attractions
        if (act.category === "sightseeing") {
          if (seenAttractions.has(titleLower)) {
            errors.push(`Duplicate attraction found: "${act.title}" on Day ${day.day}`);
          }
          seenAttractions.add(titleLower);

          // 2. Verify attraction exists in authentic list
          const cleanTitle = act.title.replace("[Hidden Gem] ", "").toLowerCase().trim();
          if (!validAttractionNames.has(cleanTitle)) {
            errors.push(`Fabricated or unverified attraction name: "${act.title}"`);
          }
        }

        // 3. Check for generic placeholder names
        const placeholders = ["city center", "grand palace", "hidden viewpoint", "local monument", "scenic view", "hotel", "bistro", "cafeteria"];
        placeholders.forEach(pl => {
          if (titleLower.includes(pl) && act.category === "sightseeing") {
            errors.push(`Placeholder name detected: "${act.title}"`);
          }
        });

        // 4. Image validation: Ensure image matches the place coordinates/identity and does not reference other countries
        if (act.images && act.images.length > 0) {
          act.images.forEach((imgUrl: string) => {
            const lowerUrl = imgUrl.toLowerCase();
            if (key !== "paris" && (lowerUrl.includes("eiffel") || lowerUrl.includes("louvre"))) {
              errors.push(`Incorrect Paris image loaded for ${destination}: "${imgUrl}"`);
            }
            if (key !== "rome" && (lowerUrl.includes("colosseum") || lowerUrl.includes("trevi"))) {
              errors.push(`Incorrect Rome image loaded for ${destination}: "${imgUrl}"`);
            }
            if (key !== "tokyo" && (lowerUrl.includes("shibuya") || lowerUrl.includes("senso"))) {
              errors.push(`Incorrect Tokyo image loaded for ${destination}: "${imgUrl}"`);
            }
          });
        }

        // 5. Coordinates validation
        if (act.coordinates) {
          const latDiff = Math.abs(act.coordinates.lat - authDest.coordinates.lat);
          const lngDiff = Math.abs(act.coordinates.lng - authDest.coordinates.lng);
          if (latDiff > 5 || lngDiff > 5) {
            errors.push(`Coordinates for "${act.title}" do not match the destination region context.`);
          }
        }
      });
    });

    // 6. Verify hotel exists in authentic list
    if (itinerary.hotels && itinerary.hotels.length > 0) {
      itinerary.hotels.forEach(hotel => {
        const hotelLower = hotel.name.toLowerCase().trim();
        if (!validHotelNames.has(hotelLower)) {
          errors.push(`Fabricated or unverified hotel recommendation: "${hotel.name}"`);
        }
      });
    }

    const isValid = errors.length === 0;
    if (isValid) {
      VoyageLogger.info("DestinationIntelligence", `Itinerary successfully validated as authentic for ${destination}.`);
    } else {
      VoyageLogger.warn("DestinationIntelligence", `Authenticity validation failed for ${destination}: ${errors.join(", ")}`);
    }

    return { valid: isValid, errors };
  }
}
