export interface Destination {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  timezone: string;
  currency: string;
  population: string;
  language: string;
  weather: string;
  safetyScore: number; // Out of 100
  dailyBudget: string; // e.g., "$150 - $250"
  bestSeason: string;
  visaRequired: boolean;
  attractions: string[];
  quickFacts: string[];
}

export interface SearchSuggestion {
  id: string;
  name: string;
  country: string;
}
