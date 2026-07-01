export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Attraction {
  title: string;
  description: string;
  cost: string;
  averageVisitDuration: string; // e.g. "2h"
  bestTimeOfDay: "sunrise" | "morning" | "afternoon" | "sunset" | "night";
  coordinates: Coordinate;
  openingHours: string;
  
  // New Metadata Fields
  categories: string[]; // e.g. ["landmark", "history", "photography"]
  popularity: number; // 0-100
  accessibility: string[]; // e.g. ["wheelchair", "assistive_audio"]
  weatherDependency: "high" | "low";
  photographyScore: number; // 0-10
  isRelaxing?: boolean;
  isHiddenGem?: boolean;
  isPhotoSpot?: boolean;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  averageCost: string;
  description: string;
}

export interface TravelTips {
  touristScams: string[];
  packingTips: string[];
  generalTips: string[];
}

export interface NearbyRecommendations {
  cafes: string[];
  restaurants: string[];
  restrooms: string[];
  parking: string[];
  metroStations: string[];
  emergencyServices: string[];
}

export interface DestinationEvent {
  title: string;
  description: string;
  month: number; // 1-12
  category: "festival" | "concert" | "exhibition" | "holiday" | "other";
  cost: string;
}

export interface DestinationKnowledge {
  destination: string;
  country: string;
  region: string;
  coordinates: Coordinate;
  language: string;
  currency: string;
  timezone: string;
  bestSeason: string;
  safetyScore: number; // 0-100
  crowdLevels: "low" | "medium" | "high";
  weatherSummary: string;
  visaNotes: string;
  emergencyContacts: {
    police: string;
    medical: string;
    fire: string;
  };
  transportation: string[];
  averageCosts: {
    accommodation: string;
    food: string;
    transit: string;
    sightseeing: string;
  };
  
  // Categorized points of interest
  mustVisitAttractions: Attraction[];
  hiddenGems: Attraction[];
  
  // Food & Dining recommendations
  dining: {
    streetFood: RestaurantRecommendation[];
    fineDining: RestaurantRecommendation[];
    cafes: RestaurantRecommendation[];
  };

  // Experiences
  nightlife: string[];
  adventureActivities: string[];
  museums: string[];
  parks: string[];
  temples: string[];
  historicalSites: string[];
  shoppingAreas: string[];
  markets: string[];
  
  // Segmented Experiences
  soloExperiences: string[];
  coupleExperiences: string[];
  familyAttractions: string[];
  luxuryExperiences: string[];
  budgetExperiences: string[];
  
  localFestivals: string[];
  travelTips: TravelTips;
  popularityScore: number; // 0-100
  userRating: number; // 0.0-5.0
  nearbyRecommendations: Record<string, NearbyRecommendations>;
  
  // Seasonal & Events lists
  seasonalActivities?: Record<string, string[]>; // Mapping "spring", "summer", "autumn", "winter" to activity titles
  events?: DestinationEvent[];
}
