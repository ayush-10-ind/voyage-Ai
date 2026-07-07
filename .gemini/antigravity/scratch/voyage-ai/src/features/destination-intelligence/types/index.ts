export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Attraction {
  title: string;
  description: string;
  cost: string;
  averageVisitDuration: string;
  bestTimeOfDay: "sunrise" | "morning" | "afternoon" | "sunset" | "night";
  coordinates: Coordinate;
  openingHours: string;
  
  // Metadata Fields
  categories: string[];
  popularity: number;
  accessibility: string[];
  weatherDependency: "high" | "low";
  photographyScore: number;
  isRelaxing?: boolean;
  isHiddenGem?: boolean;
  isPhotoSpot?: boolean;

  // Sprint 7.8 Extensions
  placeId?: string;
  phone?: string;
  address?: string;
  website?: string;
  bookingRequired?: string;
  bookingUrl?: string;
  images?: string[]; // Hero cover + Gallery images
  googleRating?: number;
  googleReviewsCount?: number;
  reviews?: Review[];
  busyHours?: Record<string, string>; // e.g. { "9 AM": "Low", "12 PM": "High" }
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
  hotels?: string[];
  atms?: string[];
  pharmacies?: string[];
}

export interface DestinationEvent {
  title: string;
  description: string;
  month: number;
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
  safetyScore: number;
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
  
  mustVisitAttractions: Attraction[];
  hiddenGems: Attraction[];
  
  dining: {
    streetFood: RestaurantRecommendation[];
    fineDining: RestaurantRecommendation[];
    cafes: RestaurantRecommendation[];
  };

  nightlife: string[];
  adventureActivities: string[];
  museums: string[];
  parks: string[];
  temples: string[];
  historicalSites: string[];
  shoppingAreas: string[];
  markets: string[];
  
  soloExperiences: string[];
  coupleExperiences: string[];
  familyAttractions: string[];
  luxuryExperiences: string[];
  budgetExperiences: string[];
  
  localFestivals: string[];
  travelTips: TravelTips;
  popularityScore: number;
  userRating: number;
  nearbyRecommendations: Record<string, NearbyRecommendations>;
  
  seasonalActivities?: Record<string, string[]>;
  events?: DestinationEvent[];
}
