export type ActivityCategory = "sightseeing" | "dining" | "transit" | "accommodation" | "other";

export interface TravelMetadata {
  mode: "walking" | "driving" | "transit" | "bicycling" | "flight" | "cycling" | "train" | "ferry";
  duration: string; // e.g., "15m"
  distance?: string; // e.g., "1.2 km"
  routeSummary?: string; // e.g., "via Broadway"
  elevationChange?: number; // in meters (extension point)
  trafficDelayMin?: number; // in minutes (extension point)
}

export interface Activity {
  id: string;
  time: string;
  duration?: string; // e.g., "1h 30m"
  title: string;
  description: string;
  cost: string;
  category: ActivityCategory;
  notes?: string;
  isFavorite?: boolean;
  travelToNext?: TravelMetadata;
  plannedCost?: number;
  actualCost?: number;
  paymentStatus?: "unpaid" | "paid" | "partially_paid";
  paymentMethod?: "credit_card" | "cash" | "digital_wallet" | "other";
  receiptUrl?: string;
  refundStatus?: "none" | "pending" | "refunded";
  coordinates?: { lat: number; lng: number };
  nearbyPOIs?: string[];
  safetyScore?: number;
  crowdLevel?: "low" | "medium" | "high";
  solarTimes?: { sunrise: string; sunset: string; goldenHour: string };
  localEvents?: string[];
  accessibilityInfo?: string[];
  transitOptions?: string[];
}

export interface Day {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  days: Day[];
  totalBudget?: number;
  currency?: string;
  manualExpenses?: ExpenseItem[];
}

export interface DragItem {
  activityId: string;
  fromDayNumber: number;
  fromIndex: number;
}

// ==========================================
// FUTURE EXTENSION INTERFACES (Release 0.4+)
// ==========================================

export interface WeatherData {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy";
  humidity?: number;
  windSpeed?: number;
  icon?: string;
}

export interface WeatherForecast {
  dayNumber: number;
  forecast: WeatherData;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: "food" | "lodging" | "transport" | "entertainment" | "shopping" | "other";
  date: string;
  activityId?: string; // Link to specific activity if applicable
  paymentMethod?: string;
  notes?: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  expenses: ExpenseItem[];
}

export interface MapWaypoint {
  activityId: string;
  title: string;
  lat: number;
  lng: number;
  sequence: number;
}

export interface MapRoute {
  dayNumber: number;
  waypoints: MapWaypoint[];
  polyline?: string; // Encoded polyline for drawing on Mapbox/Google Maps
}

export interface BookingDetails {
  id: string;
  type: "flight" | "hotel" | "rental_car" | "experience";
  provider: string; // e.g., "Delta Airlines", "Marriott"
  confirmationNumber: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  dateTime: string;
  details?: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: "clothing" | "toiletries" | "electronics" | "documents" | "misc";
  isPacked: boolean;
  suggestedByAI?: boolean;
}

