import { DestinationKnowledge } from "../types";
import { DestinationKnowledgeProvider } from "../providers/knowledge-provider";
import { MockKnowledgeProvider } from "../providers/mock-knowledge-provider";
import { VoyageLogger } from "@/lib/logger";

export class DestinationKnowledgeEngine {
  private static provider: DestinationKnowledgeProvider = new MockKnowledgeProvider();
  private static memoryCache: Record<string, DestinationKnowledge> = {};

  static setProvider(newProvider: DestinationKnowledgeProvider) {
    this.provider = newProvider;
    VoyageLogger.info("DestinationIntelligence", `Registered new knowledge provider: ${newProvider.name}`);
  }

  private static getCacheKey(destination: string): string {
    return `voyage_dest_knowledge_${destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "")}`;
  }

  private static getLocalCache(destination: string): DestinationKnowledge | null {
    if (typeof window === "undefined") return null;
    const key = this.getCacheKey(destination);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      VoyageLogger.warn("DestinationIntelligence", `Failed to read LocalStorage cache for: ${destination}`);
    }
    return null;
  }

  private static saveLocalCache(destination: string, knowledge: DestinationKnowledge) {
    if (typeof window === "undefined") return;
    const key = this.getCacheKey(destination);
    try {
      localStorage.setItem(key, JSON.stringify(knowledge));
    } catch (e) {
      VoyageLogger.warn("DestinationIntelligence", `Failed to save LocalStorage cache for: ${destination}`);
    }
  }

  static async getKnowledge(destination: string): Promise<DestinationKnowledge> {
    const key = destination.toLowerCase().trim();

    // 1. Memory Cache lookup
    if (this.memoryCache[key]) {
      VoyageLogger.info("DestinationIntelligence", `Cache hit (memory) for destination: ${destination}`);
      return this.memoryCache[key];
    }

    // 2. LocalStorage Cache lookup
    const cached = this.getLocalCache(destination);
    if (cached) {
      VoyageLogger.info("DestinationIntelligence", `Cache hit (LocalStorage) for destination: ${destination}`);
      this.memoryCache[key] = cached;
      return cached;
    }

    // 3. Provider lookup
    VoyageLogger.info("DestinationIntelligence", `Cache miss. Querying provider: ${this.provider.name} for: ${destination}`);
    const result = await this.provider.fetchDestinationKnowledge(destination);

    if (result) {
      this.memoryCache[key] = result;
      this.saveLocalCache(destination, result);
      return result;
    }

    // 4. Default Fallback Generator for unregistered cities
    VoyageLogger.info("DestinationIntelligence", `Provider returned null. Generating default fallback profile for: ${destination}`);
    const fallback = this.generateFallbackKnowledge(destination);
    this.memoryCache[key] = fallback;
    this.saveLocalCache(destination, fallback);
    return fallback;
  }

  private static generateFallbackKnowledge(destination: string): DestinationKnowledge {
    return {
      destination,
      country: "Unknown",
      region: "Global",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      language: "Local Language, English",
      currency: "USD",
      timezone: "GMT+0:00",
      bestSeason: "Spring & Autumn",
      safetyScore: 85,
      crowdLevels: "medium",
      weatherSummary: "Mild, comfortable temperatures year-round.",
      visaNotes: "Standard tourist visa required; check with your local consulate.",
      emergencyContacts: { police: "112", medical: "112", fire: "112" },
      transportation: ["Public Metro", "Taxis", "Walking"],
      averageCosts: { accommodation: "$100/night", food: "$25/day", transit: "$8/day", sightseeing: "$15/day" },
      mustVisitAttractions: [
        { 
          title: `${destination} City Center`, 
          description: "Explore the bustling historic core and surrounding architectural landmarks.", 
          cost: "Free", 
          averageVisitDuration: "2.5h", 
          bestTimeOfDay: "morning", 
          coordinates: { lat: 35.6762, lng: 139.6503 }, 
          openingHours: "24/7",
          categories: ["landmark", "culture"],
          popularity: 90,
          accessibility: ["wheelchair_accessible"],
          weatherDependency: "low",
          photographyScore: 8
        },
        { 
          title: `Main Historical Site`, 
          description: "Discover the heritage, culture, and architecture that defined this region.", 
          cost: "$10", 
          averageVisitDuration: "2h", 
          bestTimeOfDay: "afternoon", 
          coordinates: { lat: 35.6792, lng: 139.6533 }, 
          openingHours: "09:00 AM - 05:00 PM",
          categories: ["landmark", "culture"],
          popularity: 85,
          accessibility: ["guided_tours"],
          weatherDependency: "low",
          photographyScore: 8
        }
      ],
      hiddenGems: [
        { 
          title: "Local Secret Viewpoint", 
          description: "A quiet, off-the-beaten-path overlook offering sweeping panoramic vistas.", 
          cost: "Free", 
          averageVisitDuration: "1h", 
          bestTimeOfDay: "sunset", 
          coordinates: { lat: 35.6732, lng: 139.6473 }, 
          openingHours: "24/7",
          categories: ["photography", "nature"],
          popularity: 70,
          accessibility: [],
          weatherDependency: "high",
          photographyScore: 9,
          isHiddenGem: true
        },
        { 
          title: "Charming Corner Cafe", 
          description: "Relax with freshly roasted coffee and locally made pastries in a serene setting.", 
          cost: "$5", 
          averageVisitDuration: "1h", 
          bestTimeOfDay: "morning", 
          coordinates: { lat: 35.6742, lng: 139.6483 }, 
          openingHours: "08:00 AM - 06:00 PM",
          categories: ["food", "culture"],
          popularity: 72,
          accessibility: ["wheelchair_accessible"],
          weatherDependency: "low",
          photographyScore: 7,
          isRelaxing: true,
          isHiddenGem: true
        }
      ],
      dining: {
        streetFood: [
          { name: "Traditional Market stalls", cuisine: "Local Street Eats", averageCost: "$8/person", description: "Sample authentic, freshly cooked snacks from independent local vendors." }
        ],
        fineDining: [
          { name: "Grand Central Restaurant", cuisine: "Regional Gastronomy", averageCost: "$45/person", description: "Upscale dining celebrating native ingredients and heritage culinary styles." }
        ],
        cafes: [
          { name: "Artisanal Coffee Lab", cuisine: "Specialty Beverages", averageCost: "$6/person", description: "A trendy coffee shop serving pour-overs, cold brews, and baked goods." }
        ]
      },
      nightlife: ["Local bars", "Night walking tours", "Live lounge music"],
      adventureActivities: ["Guided city cycling tour", "Scenic park trekking trails"],
      museums: ["City Museum of Art", "Historical Archives Exhibition"],
      parks: ["Central Botanical Garden", "Riverside Green park"],
      temples: ["Local Sanctuary"],
      historicalSites: ["Old Clock Tower", "Ancient City Wall ruins"],
      shoppingAreas: ["Pedestrian Shopping Avenue", "Local Craft Market"],
      markets: ["Weekly farmer's market", "Antiques flea market"],
      soloExperiences: ["Biking around the older residential areas", "Visiting local libraries and archives"],
      coupleExperiences: ["Sunset walk along the main river promenade", "Cozy dinner at a heritage bistrot"],
      familyAttractions: ["Interactive science center", "Main public park playground"],
      luxuryExperiences: ["Private helicopter tour", "Personalized chauffeur-driven sightseeing tour"],
      budgetExperiences: ["Free self-guided walking audio tour", "Relaxing afternoon picnic in the botanical gardens"],
      localFestivals: ["Summer Solstice Carnival (June)", "Winter Light Festival (December)"],
      travelTips: {
        touristScams: ["Avoid unlicensed taxi operators at the main airport terminals", "Always confirm retail item prices before buying from street vendors"],
        packingTips: ["Comfortable walking shoes are essential", "Pack clothing layers for shifting evening temperatures"],
        generalTips: ["Respect local customs and dress codes at religious landmarks.", "Carry a reusable water bottle to stay hydrated."]
      },
      popularityScore: 75,
      userRating: 4.5,
      nearbyRecommendations: {}
    };
  }
}
