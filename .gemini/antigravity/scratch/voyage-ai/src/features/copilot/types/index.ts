export type MessageSender = "user" | "copilot";

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface TripPreferences {
  destination?: string;
  duration?: number;
  style?: "relaxed" | "balanced" | "fast-paced";
  budget?: "budget" | "moderate" | "luxury";
  interests?: string[];
  companions?: "solo" | "couple" | "family" | "friends";
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  cost?: string;
}

export interface Restaurant {
  name: string;
  type: string;
  cost: string;
  description?: string;
}

export interface HotelOption {
  name: string;
  rating: string;
  price: string;
  description: string;
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
  restaurants: Restaurant[];
}

export interface BudgetBreakdown {
  category: string;
  cost: string;
}

export interface TripItinerary {
  overview: string;
  days: DayItinerary[];
  budget: {
    total: string;
    breakdown: BudgetBreakdown[];
  };
  hotels: HotelOption[];
  packingList: string[];
  hiddenGems: string[];
  safetyTips: string[];
}
