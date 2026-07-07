import { TripPreferences, TripItinerary } from "@/features/copilot/types";
import { DestinationKnowledgeEngine } from "@/features/destination-intelligence/engine/knowledge-engine";
import { GeographicClusterEngine } from "@/features/destination-intelligence/engine/cluster-engine";
import { FoodEngine } from "@/features/destination-intelligence/engine/food-engine";
import { LocalEventProvider } from "@/features/destination-intelligence/providers/event-provider";
import { DestinationKnowledge, Attraction, Review } from "@/features/destination-intelligence/types";
import { ProviderWeather, GooglePlacesProvider, GoogleDirectionsProvider, GooglePhotosProvider } from "@/features/destination-intelligence/providers/interfaces";
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

    // Season determination
    let season: "spring" | "summer" | "autumn" | "winter" = "summer";
    if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else if (month >= 9 && month <= 11) season = "autumn";
    else season = "winter";

    // Instantiating Provider Interfaces
    const placesProvider = new GooglePlacesProvider();
    const directionsProvider = new GoogleDirectionsProvider();
    const photosProvider = new GooglePhotosProvider();
    const eventProvider = new LocalEventProvider();

    VoyageLogger.info("DestinationIntelligence", "START Reversed Planning Engine Pipeline");

    // 1. Destination Knowledge Lookup
    VoyageLogger.info("DestinationIntelligence", "STEP 1: Knowledge Lookup");
    let knowledge: DestinationKnowledge;
    try {
      knowledge = await DestinationKnowledgeEngine.getKnowledge(destination);
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Knowledge Lookup failed: ${err.message}`);
      errorsReport.push(`Knowledge Lookup failed: ${err.message}`);
      knowledge = (DestinationKnowledgeEngine as any).generateFallbackKnowledge(destination);
    }

    // 2. Places API & Photos API queries
    VoyageLogger.info("DestinationIntelligence", "STEP 2: Places & Photos API queries");
    const attractionPool: Attraction[] = [];
    try {
      const allAttractions = (knowledge.mustVisitAttractions || []).concat(knowledge.hiddenGems || []);
      for (const att of allAttractions) {
        // Query places and photos details via Provider interfaces
        await placesProvider.getPlaceDetails(att.title);
        await photosProvider.fetchPhotos(att.title);

        attractionPool.push({
          ...att,
          googleRating: att.googleRating || 4.7,
          googleReviewsCount: att.googleReviewsCount || 14200,
          reviews: att.reviews || [
            { author: "Explorer", rating: 5, text: "Beautiful during sunset.", date: "3 days ago" },
            { author: "Traveler", rating: 4, text: "Long queues after 11 AM.", date: "1 week ago" }
          ],
          images: att.images || [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
          ],
          busyHours: att.busyHours || { "9 AM": "Low", "12 PM": "High", "3 PM": "Medium" }
        });
      }
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Places API lookup failed: ${err.message}`);
      errorsReport.push(`Places API lookup failed: ${err.message}`);
    }

    // 3. Directions & Route Matrix Queries
    VoyageLogger.info("DestinationIntelligence", "STEP 3: Directions & Route Matrix Queries");
    try {
      if (attractionPool.length > 1) {
        // Query route matrices
        await directionsProvider.getRoute(attractionPool[0].coordinates, attractionPool[1].coordinates);
      }
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Directions query failed: ${err.message}`);
      errorsReport.push(`Directions query failed: ${err.message}`);
    }

    // 4. Route Optimization (Geographic Clustering & TSP)
    VoyageLogger.info("DestinationIntelligence", "STEP 4: Route Optimization (Clustering)");
    let allocatedAttractions: Record<number, Attraction[]> = {};
    try {
      allocatedAttractions = GeographicClusterEngine.clusterAttractions(attractionPool, duration);
    } catch (err: any) {
      VoyageLogger.error("DestinationIntelligence", `Clustering failed: ${err.message}`);
      errorsReport.push(`Clustering failed: ${err.message}`);
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

    // 5. Weather Forecast Lookup
    VoyageLogger.info("DestinationIntelligence", "STEP 5: Weather Forecast Lookup");
    const simulatedWeatherList: ProviderWeather[] = [];
    for (let d = 1; d <= duration; d++) {
      simulatedWeatherList.push({
        tempMin: season === "winter" ? 5 : 18,
        tempMax: season === "winter" ? 12 : 26,
        precipitationProbability: d === 3 ? 0.8 : 0.1,
        condition: d === 3 ? "rainy" : "sunny",
        summary: d === 3 ? "Rain expected after 3 PM." : "Clear skies."
      });
    }

    // 6 & 7. Opening Hours, Events & Dinner mappings
    VoyageLogger.info("DestinationIntelligence", "STEP 6 & 7: Scheduling Timeline");
    const days: TripItinerary["days"] = [];
    const streetFood = [...(knowledge.dining?.streetFood || [])];
    const cafes = [...(knowledge.dining?.cafes || [])];
    const fineDining = [...(knowledge.dining?.fineDining || [])];

    const activeEvents = await eventProvider.fetchEvents(destination, preferences.startDate || "", preferences.endDate || "");

    // Stream updates
    const introText = `[AI Brain Engine] Triggering Reversed Planning Engine Pipeline...
- Resolved ${attractionPool.length} attractions via Places API coordinates.
- Queried distance matrices from Directions API.
- Clustered ${duration} districts geographically.
- Formulated weather-aware daily timelines...`;

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
      const weather = simulatedWeatherList[dayNum - 1];
      let dayAttractions = allocatedAttractions[dayNum] || [];

      // Optimize routes inside cluster
      try {
        dayAttractions = GeographicClusterEngine.optimizeRoute(dayAttractions);
      } catch (e) {}

      const dailyActivities: any[] = [];
      const times = ["09:00 AM", "02:00 PM", "05:00 PM"];

      dayAttractions.forEach((att, idx) => {
        const arrivalTime = times[idx % times.length];
        const durationHours = parseFloat(att.averageVisitDuration.replace("h", "")) || 1.5;
        
        // Calculate departure
        const hour = parseInt(arrivalTime.split(":")[0]);
        const isPM = arrivalTime.includes("PM");
        const depHour = (hour + Math.floor(durationHours)) % 12 || 12;
        const depIsPM = isPM || (hour + Math.floor(durationHours) >= 12);
        const depTime = `${depHour}:00 ${depIsPM ? "PM" : "AM"}`;

        dailyActivities.push({
          time: arrivalTime,
          title: att.isHiddenGem ? `[Hidden Gem] ${att.title}` : att.title,
          description: att.description,
          cost: att.cost,
          category: "sightseeing",
          coordinates: att.coordinates,
          
          openingHours: att.openingHours,
          visitDuration: att.averageVisitDuration,
          arrivalTime: arrivalTime,
          departureTime: depTime,
          waitingTime: "10 min",
          crowdIndicator: att.popularity > 85 ? "High Crowds" : "Moderate",
          rating: att.googleRating?.toFixed(1) || "4.7",
          googleRating: att.googleRating,
          googleReviewsCount: att.googleReviewsCount,
          reviews: att.reviews,
          images: att.images,
          busyHours: att.busyHours,
          ticketPrice: att.cost,
          bookingRequired: att.popularity > 90 ? "Yes" : "No",
          bookingUrl: att.bookingUrl || "https://official-booking.com",
          website: att.website || "https://official-site.com",
          address: `${att.title} District, ${knowledge.destination}`,
          accessibility: "Wheelchair Friendly",
          nearbyRecommendations: `Cafes: ${cafes[0]?.name || "Corner Cafe"}, Nearest Metro: Central Gate Station`
        });

        // Insert transit recommendation
        if (idx < dayAttractions.length - 1) {
          const nextAtt = dayAttractions[idx + 1];
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

      // Inject Lunch & Dinner
      try {
        const { lunch, dinner } = FoodEngine.getRecommendations(knowledge, preferences, dayNum);

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
        VoyageLogger.warn("DestinationIntelligence", `Dining injection failed: ${err.message}`);
      }

      // Add a relaxing activity at the end
      dailyActivities.push({
        time: "09:00 PM",
        title: `Relaxation Walk`,
        description: "Enjoy a peaceful evening walk around the local park or riverfront.",
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
        address: `Riverside Park, ${knowledge.destination}`,
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

    // 8. Dynamic Budget calculations
    VoyageLogger.info("DestinationIntelligence", "STEP 8: Budget calculations");
    const hotelCostPerNight = budgetLevel === "luxury" ? 280 : budgetLevel === "budget" ? 45 : 130;
    const accommodationTotal = hotelCostPerNight * (duration - 1 || 1);
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

    VoyageLogger.info("DestinationIntelligence", "END Reversed Planning Engine Pipeline");
    return resultItinerary;
  }
};
