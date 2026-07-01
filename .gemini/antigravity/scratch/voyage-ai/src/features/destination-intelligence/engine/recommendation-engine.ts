import { DestinationKnowledge, Attraction, RestaurantRecommendation } from "../types";

export class DestinationRecommendationEngine {
  static getPersonalizedAttractions(
    knowledge: DestinationKnowledge,
    interests: string[],
    companions: string,
    budget: string
  ): Attraction[] {
    const list = [...knowledge.mustVisitAttractions];
    
    // Sort attractions to prioritize those matching interests or style
    return list.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      const titleA = a.title.toLowerCase();
      const descA = a.description.toLowerCase();
      const titleB = b.title.toLowerCase();
      const descB = b.description.toLowerCase();

      // Check interests match
      interests.forEach(interest => {
        const keyword = interest.toLowerCase().trim();
        if (titleA.includes(keyword) || descA.includes(keyword)) scoreA += 3;
        if (titleB.includes(keyword) || descB.includes(keyword)) scoreB += 3;
      });

      // Traveler Type matches
      if (companions === "solo") {
        if (titleA.includes("walk") || titleA.includes("museum")) scoreA += 1;
        if (titleB.includes("walk") || titleB.includes("museum")) scoreB += 1;
      } else if (companions === "family") {
        if (titleA.includes("fort") || titleA.includes("park") || titleA.includes("lake")) scoreA += 2;
        if (titleB.includes("fort") || titleB.includes("park") || titleB.includes("lake")) scoreB += 2;
      }

      // Budget filter/weighting
      const costA = a.cost === "Free" ? 0 : parseFloat(a.cost.replace(/[^0-9.]/g, ""));
      const costB = b.cost === "Free" ? 0 : parseFloat(b.cost.replace(/[^0-9.]/g, ""));
      
      if (budget === "budget") {
        if (costA < costB) scoreA += 2;
        if (costB < costA) scoreB += 2;
      } else if (budget === "luxury") {
        if (costA > costB) scoreA += 2;
        if (costB > costA) scoreB += 2;
      }

      return scoreB - scoreA;
    });
  }

  static getPersonalizedDining(
    knowledge: DestinationKnowledge,
    budget: string
  ): RestaurantRecommendation[] {
    if (budget === "budget") {
      return [...knowledge.dining.streetFood, ...knowledge.dining.cafes];
    }
    if (budget === "luxury") {
      return [...knowledge.dining.fineDining, ...knowledge.dining.cafes];
    }
    // Moderate: mix of street food, cafes, and fine dining
    return [
      ...knowledge.dining.cafes,
      ...knowledge.dining.streetFood.slice(0, 1),
      ...knowledge.dining.fineDining.slice(0, 1)
    ];
  }
}
