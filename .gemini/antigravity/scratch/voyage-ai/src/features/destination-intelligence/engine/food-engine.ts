import { DestinationKnowledge, RestaurantRecommendation } from "../types";
import { TripPreferences } from "@/features/copilot/types";

export class FoodEngine {
  /**
   * Filters and categorizes dining recommendations matching budget and style preferences.
   */
  static getRecommendations(
    knowledge: DestinationKnowledge,
    preferences: TripPreferences,
    dayIndex: number
  ): { lunch: RestaurantRecommendation; dinner: RestaurantRecommendation } {
    const budget = preferences.budget || "moderate";
    const interests = preferences.interests || [];
    const isVegetarian = interests.some(i => i.toLowerCase().includes("veg") || i.toLowerCase().includes("nature"));

    const streetFood = knowledge.dining?.streetFood || [];
    const cafes = knowledge.dining?.cafes || [];
    const fineDining = knowledge.dining?.fineDining || [];

    // Fallback templates
    const defaultLunch: RestaurantRecommendation = {
      name: "Local Street Bistro",
      cuisine: "Regional Specialties",
      averageCost: "$8/person",
      description: "Enjoy hot, authentic street snacks cooked using traditional recipes."
    };

    const defaultDinner: RestaurantRecommendation = {
      name: "Grand City Tavern",
      cuisine: "Heritage Diner",
      averageCost: "$22/person",
      description: "Traditional seating serving slow-cooked stews and locally sourced grills."
    };

    let selectedLunch = defaultLunch;
    let selectedDinner = defaultDinner;

    // Determine category based on budget and vegetarian flags
    if (budget === "budget") {
      selectedLunch = streetFood[dayIndex % (streetFood.length || 1)] || defaultLunch;
      selectedDinner = cafes[dayIndex % (cafes.length || 1)] || defaultDinner;
    } else if (budget === "luxury") {
      selectedLunch = fineDining[dayIndex % (fineDining.length || 1)] || defaultLunch;
      // Simulate Michelin star dining
      const michelinMatch = fineDining[(dayIndex + 1) % (fineDining.length || 1)] || defaultDinner;
      selectedDinner = {
        ...michelinMatch,
        name: `Michelin Star: ${michelinMatch.name}`,
        description: `[Michelin Rated Dining] ${michelinMatch.description}`
      };
    } else {
      // Moderate budget
      selectedLunch = cafes[dayIndex % (cafes.length || 1)] || defaultLunch;
      selectedDinner = fineDining[dayIndex % (fineDining.length || 1)] || defaultDinner;
    }

    // Vegetarian overrides
    if (isVegetarian) {
      selectedLunch = {
        ...selectedLunch,
        cuisine: `${selectedLunch.cuisine} (Vegetarian Option)`,
        description: `[Vegetarian Friendly] ${selectedLunch.description}`
      };
      selectedDinner = {
        ...selectedDinner,
        cuisine: `${selectedDinner.cuisine} (Vegetarian Option)`,
        description: `[Vegetarian Friendly] ${selectedDinner.description}`
      };
    }

    return {
      lunch: selectedLunch,
      dinner: selectedDinner
    };
  }
}
