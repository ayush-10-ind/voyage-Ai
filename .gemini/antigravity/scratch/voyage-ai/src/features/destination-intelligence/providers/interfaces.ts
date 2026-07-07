import { Coordinate, DestinationKnowledge, RestaurantRecommendation } from "../types";

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

export interface DirectionsProvider extends RouteProvider {}

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
  precipitationProbability: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";
  summary: string;
}

export interface WeatherProvider {
  name: string;
  getForecast(coords: Coordinate, dateStr: string): Promise<ProviderWeather>;
}

export interface DestinationProvider {
  name: string;
  searchDestination(query: string): Promise<DestinationKnowledge | null>;
}

export interface FoodProvider {
  name: string;
  fetchDiningSpots(coords: Coordinate, budget: string): Promise<RestaurantRecommendation[]>;
}

export interface MapsProvider {
  name: string;
  getStaticMapUrl(coords: Coordinate, zoom?: number): string;
  getDirectionsUrl(origin: Coordinate, destination: Coordinate): string;
}

export interface TrafficProvider {
  name: string;
  getDelayFactor(origin: Coordinate, destination: Coordinate): Promise<number>;
}

export interface PhotosProvider {
  name: string;
  fetchPhotos(query: string): Promise<string[]>;
}

// FUTURE PROVIDERS STUBS
export class GooglePlacesProvider implements PlacesProvider {
  name = "GooglePlacesProvider";
  async searchNearby(coords: Coordinate, radiusMeters: number, category?: string) { return []; }
  async getPlaceDetails(placeId: string) { return null; }
}

export class GoogleDirectionsProvider implements DirectionsProvider {
  name = "GoogleDirectionsProvider";
  async getRoute(origin: Coordinate, destination: Coordinate, mode?: string) {
    return { distanceMeters: 1000, durationSeconds: 600, recommendedMode: "walking" as const, directionsHtml: [] };
  }
}

export class MapboxDirectionsProvider implements DirectionsProvider {
  name = "MapboxDirectionsProvider";
  async getRoute(origin: Coordinate, destination: Coordinate, mode?: string) {
    return { distanceMeters: 1000, durationSeconds: 600, recommendedMode: "walking" as const, directionsHtml: [] };
  }
}

export class TicketmasterEventsProvider implements EventsProvider {
  name = "TicketmasterEventsProvider";
  async fetchEvents(destination: string, startDate: string, endDate: string) { return []; }
}

export class OpenWeatherProvider implements WeatherProvider {
  name = "OpenWeatherProvider";
  async getForecast(coords: Coordinate, dateStr: string) {
    return { tempMin: 15, tempMax: 25, precipitationProbability: 0, condition: "sunny" as const, summary: "Clear" };
  }
}

export class GooglePhotosProvider implements PhotosProvider {
  name = "GooglePhotosProvider";
  async fetchPhotos(query: string) { return []; }
}

export class UnsplashPhotosProvider implements PhotosProvider {
  name = "UnsplashPhotosProvider";
  async fetchPhotos(query: string) { return []; }
}
