import { TripPreferences, TripItinerary } from "@/features/copilot/types";
import { DestinationKnowledgeEngine } from "@/features/destination-intelligence/engine/knowledge-engine";
import { GeographicClusterEngine } from "@/features/destination-intelligence/engine/cluster-engine";
import { FoodEngine } from "@/features/destination-intelligence/engine/food-engine";
import { LocalEventProvider } from "@/features/destination-intelligence/providers/event-provider";
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
  return new Date().getMonth() + 1;
};

export const mockCopilotService: AICopilotService = {
  async generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary> {
    const destination = preferences.destination || "Tokyo";
    const duration = preferences.duration || 3;
    const budgetLevel = preferences.budget || "moderate";
    const travelStyle = preferences.style || preferences.travelStyle || "balanced";
    const travelerCompanions = preferences.companions || "solo";
    const travelers = preferences.travelers || 1;

    const errorsReport: string[] = [];
    const month = detectMonth(preferences);

    // Identify season based on month
    let season: "spring" | "summer" | "autumn" | "winter" = "summer";
    if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else if (month >= 9 && month <= 11) season = "autumn";
    else season = "winter";

    // --- STAGE 1: KNOWLEDGE ENGINE ---
    VoyageLogger.info("DestinationIntelligence", "START Knowledge Engine");
    let knowledge: DestinationKnowledge;
    try {
      knowledge = await DestinationKnowledgeEngine.getKnowledge(destination);
      VoyageLogger.info("DestinationIntelligence", "END Knowledge Engine");
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Knowledge Engine failed. Reason: ${err.message || err}`);
      errorsReport.push(`Knowledge Engine failed: ${err.message || err}`);
      knowledge = (DestinationKnowledgeEngine as any).generateFallbackKnowledge(destination);
    }

    // --- STAGE 2: EVENT INTELLIGENCE ---
    VoyageLogger.info("DestinationIntelligence", "START Event Intelligence");
    let activeEvents: any[] = [];
    try {
      const eventProvider = new LocalEventProvider();
      activeEvents = await eventProvider.fetchEvents(destination, preferences.startDate || "", preferences.endDate || "");
      VoyageLogger.info("DestinationIntelligence", "END Event Intelligence");
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Event Intelligence failed: ${err.message}`);
      errorsReport.push(`Event Intelligence failed: ${err.message}`);
    }

    // --- STAGE 3: PLANNING ENGINE & GEOGRAPHIC CLUSTERING ---
    VoyageLogger.info("DestinationIntelligence", "START Planning & Clustering");
    const attractionPool: Attraction[] = [];
    const addedTitles = new Set<string>();

    const addUniqueToPool = (att: Attraction) => {
      const titleKey = att.title.toLowerCase().trim();
      if (!addedTitles.has(titleKey)) {
        addedTitles.add(titleKey);
        attractionPool.push(att);
      }
    };

    try {
      // 30% Hidden Gems / 70% Popular target balancing
      const populars = (knowledge.mustVisitAttractions || []).slice(0, 8);
      const gems = (knowledge.hiddenGems || []).slice(0, 4);

      populars.forEach(addUniqueToPool);
      gems.forEach(addUniqueToPool);

      // Add active events to pool
      activeEvents.forEach(evt => {
        addUniqueToPool({
          title: evt.title,
          description: `[Seasonal Event] ${evt.description}`,
          cost: "Free",
          averageVisitDuration: "2h",
          bestTimeOfDay: evt.category === "festival" ? "afternoon" : "night",
          coordinates: evt.coordinates,
          openingHours: "10:00 AM - 09:00 PM",
          categories: ["culture", "photography"],
          popularity: 92,
          accessibility: ["wheelchair_accessible"],
          weatherDependency: "high",
          photographyScore: 9
        });
      });
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Planning Engine failed: ${err.message}`);
      errorsReport.push(`Planning Engine failed: ${err.message}`);
    }

    // Geoclustering: Divide pool into district clusters
    let allocatedAttractions: Record<number, Attraction[]> = {};
    try {
      allocatedAttractions = GeographicClusterEngine.clusterAttractions(attractionPool, duration);
      VoyageLogger.info("DestinationIntelligence", "END Planning & Clustering");
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Geographic clustering failed. Reason: ${err.message}`);
      errorsReport.push(`Geographic clustering failed: ${err.message}`);
      
      // Fallback simple allocation
      allocatedAttractions = {};
      for (let d = 1; d <= duration; d++) {
        allocatedAttractions[d] = [];
      }
      attractionPool.forEach((att, index) => {
        const d = (index % duration) + 1;
        if (allocatedAttractions[d].length < 3) {
          allocatedAttractions[d].push(att);
        }
      });
    }

    // --- STAGE 4: ROUTE OPTIMIZATION & DAILY SCHEDULER ---
    VoyageLogger.info("DestinationIntelligence", "START Route Optimization & Day Scheduling");
    const days: TripItinerary["days"] = [];

    // Streaming updates
    const introText = `[AI Brain Engine] Generating Intelligent Local Expert Itinerary for ${knowledge.destination}...
- District geoclustering complete. Unique regional focus mapped for all ${duration} days.
- Applying Traveling Salesman (Nearest Neighbor) path optimization.
- Formatting detailed arrival/departure schedules and outdoor weather safety checks...`;

    if (onTextChunk) {
      const words = introText.split(" ");
      for (let i = 0; i < words.length; i++) {
        onTextChunk(words[i] + " ");
        await sleep(10 + Math.random() * 5);
      }
    } else {
      await sleep(100);
    }

    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      let rawDayAttractions = allocatedAttractions[dayNum] || [];

      // Optimize routes inside cluster (minimize walking distance)
      let optimizedDayAttractions: Attraction[] = [];
      try {
        optimizedDayAttractions = GeographicClusterEngine.optimizeRoute(rawDayAttractions);
      } catch (err) {
        optimizedDayAttractions = rawDayAttractions;
      }

      // Day weather settings
      const weatherCondition = dayNum === 3 ? "rainy" : "sunny";
      const temp = season === "winter" ? 8 : 22;
      const weatherSummary = weatherCondition === "rainy" ? "Light Rain Expected" : "Sunny & Clear";

      const dailyActivities: any[] = [];
      const times = ["09:00 AM", "02:00 PM", "05:00 PM"];

      // Setup timeline activities
      optimizedDayAttractions.forEach((att, idx) => {
        const arrivalTime = times[idx % times.length];
        const durationHours = parseFloat(att.averageVisitDuration.replace("h", "")) || 1.5;
        
        // Calculate departure time
        const hour = parseInt(arrivalTime.split(":")[0]);
        const isPM = arrivalTime.includes("PM");
        const depHour = (hour + Math.floor(durationHours)) % 12 || 12;
        const depIsPM = isPM || (hour + Math.floor(durationHours) >= 12);
        const depTime = `${depHour}:${String(Math.round((durationHours % 1) * 60)).padStart(2, "0")} ${depIsPM ? "PM" : "AM"}`;

        dailyActivities.push({
          time: arrivalTime,
          title: att.isHiddenGem ? `[Hidden Gem] ${att.title}` : att.title,
          description: att.description,
          cost: att.cost,
          category: "sightseeing",
          coordinates: att.coordinates,
          
          // Sprint 7.7 Metadata parameters
          openingHours: att.openingHours,
          visitDuration: att.averageVisitDuration,
          arrivalTime: arrivalTime,
          departureTime: depTime,
          waitingTime: "10 min",
          crowdIndicator: att.popularity > 85 ? "High Crowds" : "Moderate",
          rating: (4.0 + (att.popularity / 100)).toFixed(1),
          ticketPrice: att.cost,
          bookingRequired: att.popularity > 90 ? "Yes" : "No",
          address: `${att.title} District, ${knowledge.destination}`,
          website: `https://www.${att.title.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          accessibility: att.accessibility.includes("wheelchair_accessible") ? "Wheelchair Friendly" : "Standard",
          nearbyRecommendations: `Cafes: ${knowledge.dining.cafes[0]?.name || "Local Corner Cafe"}, Nearest Metro: Central Gate Station`
        });

        // Insert transit recommendations between activities
        if (idx < optimizedDayAttractions.length - 1) {
          const nextAtt = optimizedDayAttractions[idx + 1];
          dailyActivities.push({
            time: depTime,
            title: `Transit to ${nextAtt.title}`,
            description: `Transferring to ${nextAtt.title}. We recommend walking or metro.`,
            cost: "Free",
            category: "transit",
            travelTime: "15 min",
            distance: "1.2 km"
          });
        }
      });

      // Insert Food Engine dining recommendations
      try {
        const { lunch, dinner } = FoodEngine.getRecommendations(knowledge, preferences, dayNum);

        // Insert Lunch before afternoon attraction
        const afternoonIdx = dailyActivities.findIndex(a => a.time === "02:00 PM" || a.time === "05:00 PM");
        const insertLunchIdx = afternoonIdx >= 0 ? afternoonIdx : dailyActivities.length;

        dailyActivities.splice(insertLunchIdx, 0, {
          time: "01:00 PM",
          title: `Lunch at ${lunch.name}`,
          description: `[Local Food Experience] Cuisine: ${lunch.cuisine}. ${lunch.description}`,
          cost: lunch.averageCost,
          category: "dining",
          openingHours: "11:30 AM - 03:00 PM",
          visitDuration: "1h",
          arrivalTime: "01:00 PM",
          departureTime: "02:00 PM",
          waitingTime: "5 min",
          crowdIndicator: "Moderate",
          rating: "4.7",
          ticketPrice: lunch.averageCost,
          bookingRequired: "No",
          address: `Food Street, ${knowledge.destination}`,
          website: "https://local-dining.com",
          accessibility: "Family Friendly",
          nearbyRecommendations: "Nearest Metro: Food Market Square"
        });

        // Append Dinner at end of day
        dailyActivities.push({
          time: "07:30 PM",
          title: `Dinner at ${dinner.name}`,
          description: `[Local Food Experience] Cuisine: ${dinner.cuisine}. ${dinner.description}`,
          cost: dinner.averageCost,
          category: "dining",
          openingHours: "06:00 PM - 11:00 PM",
          visitDuration: "1.5h",
          arrivalTime: "07:30 PM",
          departureTime: "09:00 PM",
          waitingTime: "15 min",
          crowdIndicator: "High",
          rating: "4.9",
          ticketPrice: dinner.averageCost,
          bookingRequired: "Yes",
          address: `Downtown Diner, ${knowledge.destination}`,
          website: "https://local-dining.com",
          accessibility: "Family Friendly",
          nearbyRecommendations: "Nearest Parking Available"
        });
      } catch (err: any) {
        VoyageLogger.warn("DestinationIntelligence", `Food Engine mapping failed: ${err.message}`);
      }

      // Add a relaxing walk/sunset spot
      dailyActivities.push({
        time: "09:00 PM",
        title: `Sunset Walk / Relaxation`,
        description: "Unwind at a local park or scenic overlook to close out the day.",
        cost: "Free",
        category: "other",
        openingHours: "24/7",
        visitDuration: "45 min",
        arrivalTime: "09:00 PM",
        departureTime: "09:45 PM",
        waitingTime: "None",
        crowdIndicator: "Low",
        rating: "4.6",
        ticketPrice: "Free",
        bookingRequired: "No",
        address: `Riverside Promenade, ${knowledge.destination}`,
        website: "https://local-parks.com",
        accessibility: "Pet Friendly",
        nearbyRecommendations: "Nearest ATM: Central Square Bank"
      });

      days.push({
        day: dayNum,
        title: dayNum === 1 ? "Historic Core & Old Landmarks" : dayNum === 2 ? "Scenic Hidden Gardens" : "Cultural Life & Local Flavors",
        activities: dailyActivities,
        restaurants: []
      });
    }
    VoyageLogger.info("DestinationIntelligence", "END Route Optimization & Day Scheduling");

    // --- STAGE 5: DYNAMIC BUDGET & TIMELINE BUILDER ---
    VoyageLogger.info("DestinationIntelligence", "START Dynamic Budget & Timeline Builder");
    
    // Hotel cost calculations
    const hotelCostPerNight = budgetLevel === "luxury" ? 280 : budgetLevel === "budget" ? 45 : 130;
    const accommodationTotal = hotelCostPerNight * (duration - 1 || 1);
    
    // Activity cost calculations
    const ticketCostTotal = 80 * duration;
    const foodCostTotal = 50 * duration * travelers;
    const transitCostTotal = 15 * duration;
    const emergencyBuffer = 45;
    
    const totalSpend = accommodationTotal + ticketCostTotal + foodCostTotal + transitCostTotal + emergencyBuffer;
    const dailySpend = Math.round(totalSpend / duration);

    const budgetBreakdown = [
      { category: "Accommodation Lodging", cost: `$${accommodationTotal.toLocaleString()}` },
      { category: "Activities & Monuments Tickets", cost: `$${ticketCostTotal.toLocaleString()}` },
      { category: "Traditional Dining & Meals", cost: `$${foodCostTotal.toLocaleString()}` },
      { category: "Local Transit & Directions", cost: `$${transitCostTotal.toLocaleString()}` },
      { category: "Emergency Buffer & Taxes", cost: `$${emergencyBuffer.toLocaleString()}` }
    ];

    const hotelSelectedName = budgetLevel === "luxury" 
      ? `Grand ${knowledge.destination} Palace Hotel` 
      : budgetLevel === "budget" 
        ? `${knowledge.destination} City Hostel` 
        : `${knowledge.destination} Boutique Suites`;

    const resultItinerary: TripItinerary = {
      overview: `Designed by local guide expert. ${duration}-day region-optimized plan in ${knowledge.destination}, ${knowledge.country}. Expected Daily Spend: $${dailySpend.toLocaleString()}/day. Stays: ${hotelSelectedName}.`,
      days,
      budget: {
        total: `$${totalSpend.toLocaleString()}`,
        breakdown: budgetBreakdown
      },
      hotels: [
        {
          name: hotelSelectedName,
          rating: "4.9",
          price: `$${hotelCostPerNight}/night`,
          description: `Excellent location in Central District. Easy access to main metro lines and local cafes.`
        }
      ],
      packingList: (knowledge.travelTips?.packingTips || []).concat([`Appropriate layers for ${season} season`]),
      hiddenGems: (knowledge.hiddenGems || []).slice(0, 3).map(g => g.title),
      safetyTips: [
        `Safety Score: ${knowledge.safetyScore}/100. Local police contact: ${knowledge.emergencyContacts?.police || "112"}.`,
        knowledge.travelTips?.touristScams?.[0] || "Be aware of local street solicitors."
      ],
      travelers,
      companions: travelerCompanions
    };

    if (errorsReport.length > 0) {
      resultItinerary.overview += `\n\n[Warning Report]:\n` + errorsReport.map(e => `- ${e}`).join("\n");
    }

    VoyageLogger.info("DestinationIntelligence", "END Dynamic Budget & Timeline Builder");
    return resultItinerary;
  }
};
