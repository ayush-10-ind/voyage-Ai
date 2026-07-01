import { Coordinate, Attraction } from "../types";

export interface ProviderPlace {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: Coordinate;
  rating: number;
  userRatingsTotal: number;
  categories: string[];
  costEstimate: string;
}

export interface PlacesProvider {
  name: string;
  searchNearby(coords: Coordinate, radiusMeters: number, category?: string): Promise<ProviderPlace[]>;
  getPlaceDetails(placeId: string): Promise<ProviderPlace | null>;
}

export interface RouteSummary {
  distanceMeters: number;
  durationSeconds: number;
  recommendedMode: "walking" | "driving" | "transit" | "bicycling";
  directionsHtml: string[];
}

export interface RouteProvider {
  name: string;
  getRoute(origin: Coordinate, destination: Coordinate, mode?: string): Promise<RouteSummary>;
}

export interface ProviderEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venueName: string;
  coordinates: Coordinate;
  category: "festival" | "concert" | "sports" | "exhibition" | "holiday" | "other";
}

export interface EventsProvider {
  name: string;
  fetchEvents(destination: string, startDate: string, endDate: string): Promise<ProviderEvent[]>;
}

export interface ProviderWeather {
  tempMin: number;
  tempMax: number;
  precipitationProbability: number; // 0.0 to 1.0
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";
  summary: string;
}

export interface WeatherProvider {
  name: string;
  getForecast(coords: Coordinate, dateStr: string): Promise<ProviderWeather>;
}
