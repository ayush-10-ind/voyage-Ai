import { TripPreferences, TripItinerary } from "@/features/copilot/types";
import { DestinationKnowledgeEngine } from "@/features/destination-intelligence/engine/knowledge-engine";
import { TripPlanningEngine } from "@/features/destination-intelligence/engine/planning-engine";
import { TripOptimizationEngine, ScheduledActivity } from "@/features/destination-intelligence/engine/optimization-engine";
import { DestinationKnowledge, Attraction, RestaurantRecommendation } from "@/features/destination-intelligence/types";
import { ProviderWeather } from "@/features/destination-intelligence/providers/interfaces";
import { VoyageLogger } from "@/lib/logger";

export interface AICopilotService {
  generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const detectMonth = (preferences: TripPreferences): number => {
  if (preferences.startDate) {
    const date = new Date(preferences.startDate);
    if (!isNaN(date.getTime())) {
      return date.getMonth() + 1; // 1-12
    }
  }
  // Check if user set interests or companions that hint at winter/christmas (December)
  return new Date().getMonth() + 1;
};

export const mockCopilotService: AICopilotService = {
  async generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary> {
    const destination = preferences.destination || "Tokyo";
    const duration = preferences.duration || 5;
    const budgetLevel = preferences.budget || "moderate";
    const travelStyle = preferences.style || preferences.travelStyle || "balanced";
    const travelerCompanions = preferences.companions || "solo";
    const travelers = preferences.travelers || 1;
    const transportationPreference = preferences.transportationPreference || "Public Transport";

    // 1. Fetch destination knowledge
    const knowledge = await DestinationKnowledgeEngine.getKnowledge(destination);
    const month = detectMonth(preferences);

    // Identify season based on month
    let season: "spring" | "summer" | "autumn" | "winter" = "summer";
    if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else if (month >= 9 && month <= 11) season = "autumn";
    else season = "winter";

    // 2. Build the Attraction Pool (Deduplicated)
    const attractionPool: Attraction[] = [];
    const addedTitles = new Set<string>();

    const addUniqueToPool = (att: Attraction) => {
      const titleKey = att.title.toLowerCase().trim();
      if (!addedTitles.has(titleKey)) {
        addedTitles.add(titleKey);
        attractionPool.push(att);
      }
    };

    // Add Must Visits & Hidden Gems
    knowledge.mustVisitAttractions.forEach(addUniqueToPool);
    knowledge.hiddenGems.forEach(addUniqueToPool);

    // Seasonal Intelligence: Enrich pool with specific seasonal activities from destination knowledge
    if (knowledge.seasonalActivities && knowledge.seasonalActivities[season]) {
      knowledge.seasonalActivities[season].forEach(actTitle => {
        // Find if this seasonal activity matches any attraction, or create a mock attraction block
        const matched = knowledge.mustVisitAttractions.concat(knowledge.hiddenGems).find(a => a.title.toLowerCase().includes(actTitle.toLowerCase()));
        if (matched) {
          addUniqueToPool(matched);
        } else {
          // Dynamic mock attraction for seasonal activity
          addUniqueToPool({
            title: actTitle,
            description: `A seasonal highlight in ${knowledge.destination} during ${season} season.`,
            cost: "Free",
            averageVisitDuration: "1.5h",
            bestTimeOfDay: "afternoon",
            coordinates: { ...knowledge.coordinates, lat: knowledge.coordinates.lat + 0.01 },
            openingHours: "24/7",
            categories: ["culture", "nature"],
            popularity: 85,
            accessibility: [],
            weatherDependency: "high",
            photographyScore: 8
          });
        }
      });
    }

    // Event Intelligence: Sync events that occur in the current trip month
    const activeEvents = (knowledge.events || []).filter(e => e.month === month);
    activeEvents.forEach(evt => {
      addUniqueToPool({
        title: evt.title,
        description: `[Seasonal Event] ${evt.description}`,
        cost: evt.cost,
        averageVisitDuration: "2h",
        bestTimeOfDay: evt.category === "concert" ? "night" : "afternoon",
        coordinates: { ...knowledge.coordinates, lat: knowledge.coordinates.lat - 0.01 },
        openingHours: "10:00 AM - 09:00 PM",
        categories: [evt.category, "culture"],
        popularity: 90,
        accessibility: ["wheelchair_accessible"],
        weatherDependency: "high",
        photographyScore: 9
      });
    });

    // 3. AI thoughts / Streaming log
    const introText = `[AI Brain Engine] Querying Destination Knowledge Graph for ${knowledge.destination}...
- Found: ${knowledge.mustVisitAttractions.length} must-visits, ${knowledge.hiddenGems.length} hidden gems.
- Season Detected: ${season.toUpperCase()} (Month ${month}) | Custom weather: ${knowledge.weatherSummary}
- Event Check: Found ${activeEvents.length} local events for month: ${month}.
- Triggering Geoclustering & Route Optimization across ${duration} days...`;

    if (onTextChunk) {
      const words = introText.split(" ");
      for (let i = 0; i < words.length; i++) {
        onTextChunk(words[i] + " ");
        await sleep(15 + Math.random() * 10);
      }
    } else {
      await sleep(1000);
    }

    // 4. Rank attractions
    const rankedAttractions = TripPlanningEngine.rankAttractions(attractionPool, preferences);

    // 5. Cluster and allocate across days
    const allocatedAttractions = TripPlanningEngine.allocateAttractions(rankedAttractions, duration);

    // 6. Optimize Day schedules
    const days: TripItinerary["days"] = [];

    // Filter dining recommendations
    const streetFood = [...knowledge.dining.streetFood];
    const cafes = [...knowledge.dining.cafes];
    const fineDining = [...knowledge.dining.fineDining];

    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      // Simulate changing weather across days (Day 2 is set to Rainy to test weather-aware swaps!)
      const weatherCondition = dayNum === 2 ? "rainy" : "sunny";
      const simulatedWeather: ProviderWeather = {
        tempMin: season === "winter" ? 2 : 18,
        tempMax: season === "winter" ? 8 : 28,
        precipitationProbability: weatherCondition === "rainy" ? 0.9 : 0.1,
        condition: weatherCondition,
        summary: weatherCondition === "rainy" ? "Rain showers expected throughout afternoon." : "Clear, sunny skies."
      };

      const dayAttractions = allocatedAttractions[dayNum] || [];
      const optimizedActivities = TripOptimizationEngine.optimizeDay(dayNum, dayAttractions, knowledge, simulatedWeather);

      // Map ScheduledActivity to Copilot Activity
      const mappedActivities: any[] = optimizedActivities.map(act => {
        // Enforce required formatting for hidden gems
        const isHidden = knowledge.hiddenGems.some(g => g.title.toLowerCase().trim() === act.title.toLowerCase().trim()) || act.title.startsWith("[Hidden Gem]");
        const cleanTitle = isHidden && !act.title.startsWith("[Hidden Gem]") ? `[Hidden Gem] ${act.title}` : act.title;

        return {
          time: act.time,
          title: cleanTitle,
          description: act.description,
          cost: act.cost,
          category: act.category
        };
      });

      // Inject local food dining slots (Lunch and Dinner)
      const lunchTime = "01:00 PM";
      const dinnerTime = "07:30 PM";

      // Select local food item based on day index
      const lunchRecommendation = streetFood[(dayNum - 1) % streetFood.length] || cafes[0];
      const dinnerRecommendation = fineDining[(dayNum - 1) % fineDining.length] || fineDining[0] || lunchRecommendation;

      // Insert Lunch slot before afternoon/sunset activities
      const afternoonIdx = mappedActivities.findIndex(a => a.time === "01:30 PM" || a.time === "04:30 PM");
      const insertLunchIdx = afternoonIdx >= 0 ? afternoonIdx : mappedActivities.length;
      
      mappedActivities.splice(insertLunchIdx, 0, {
        time: lunchTime,
        title: `Lunch: ${lunchRecommendation.name}`,
        description: `[Local Food Experience] Cuisine: ${lunchRecommendation.cuisine}. ${lunchRecommendation.description}`,
        cost: lunchRecommendation.averageCost,
        category: "dining"
      });

      // Append Dinner slot at the end
      mappedActivities.push({
        time: dinnerTime,
        title: `Dinner: ${dinnerRecommendation.name}`,
        description: `[Local Food Experience] Cuisine: ${dinnerRecommendation.cuisine}. ${dinnerRecommendation.description}`,
        cost: dinnerRecommendation.averageCost,
        category: "dining"
      });

      days.push({
        day: dayNum,
        title: `Explore ${dayAttractions[0]?.title || "Local Sights"}`,
        activities: mappedActivities,
        restaurants: [
          {
            name: lunchRecommendation.name,
            type: lunchRecommendation.cuisine,
            cost: lunchRecommendation.averageCost,
            description: lunchRecommendation.description
          }
        ]
      });
    }

    // 7. Calculate total budget based on averageCosts of this destination
    const costAccommodationPerNight = budgetLevel === "luxury" ? 280 : budgetLevel === "budget" ? 35 : 120;
    const costSightseeingPerDay = parseFloat(knowledge.averageCosts.sightseeing.replace(/[^0-9.]/g, "")) || 15;
    const costFoodPerDay = parseFloat(knowledge.averageCosts.food.replace(/[^0-9.]/g, "")) || 20;

    const accommodationTotal = costAccommodationPerNight * (duration - 1 || 1);
    const activityFoodTotal = (costSightseeingPerDay + costFoodPerDay) * duration * travelers;
    const totalBudgetVal = accommodationTotal + activityFoodTotal;

    const budgetBreakdown = [
      { category: "Lodging & Accommodations", cost: `$${accommodationTotal.toLocaleString()}` },
      { category: "Activities, Meals & Local Transit", cost: `$${activityFoodTotal.toLocaleString()}` }
    ];

    const hotelName = budgetLevel === "luxury" 
      ? `Grand ${knowledge.destination} Heritage Resort` 
      : budgetLevel === "budget" 
        ? `${knowledge.destination} Backpacker Dorms` 
        : `${knowledge.destination} Boutique Hotel & Suites`;

    // Extract hidden gems in this trip
    const tripGems = attractionPool.filter(a => a.isHiddenGem || knowledge.hiddenGems.some(g => g.title === a.title)).map(a => a.title);

    return {
      overview: `A realistic, geoclustered ${duration}-day travel plan in ${knowledge.destination}, ${knowledge.country}. Tailored for ${travelers} traveler(s) during ${season} season. Stays: ${hotelName}.`,
      days,
      budget: {
        total: `$${totalBudgetVal.toLocaleString()}`,
        breakdown: budgetBreakdown
      },
      hotels: [
        {
          name: hotelName,
          rating: "4.8",
          price: `$${costAccommodationPerNight}/night`,
          description: `Recommended lodging matching your ${budgetLevel} budget. Perfect location with easy transit access.`
        }
      ],
      packingList: knowledge.travelTips.packingTips.concat([`Appropriate layers for ${season} season`]),
      hiddenGems: tripGems.slice(0, 3),
      safetyTips: [
        `Safety Score: ${knowledge.safetyScore}/100. Emergency contacts: Police: ${knowledge.emergencyContacts.police}, Medical: ${knowledge.emergencyContacts.medical}.`,
        knowledge.travelTips.touristScams[0] || "Standard travel precautions apply."
      ],
      travelers,
      companions: travelerCompanions
    };
  }
};
