/**
 * Stable extension interfaces for future Voyage AI modules.
 * These interfaces define the contracts for integration in subsequent releases.
 */

// 1. Hotel Module Extension Point
export interface HotelReservation {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType?: string;
  confirmationNumber?: string;
  cost: number;
  coordinates?: { lat: number; lng: number };
}

// 2. Flight Module Extension Point
export interface FlightBooking {
  id: string;
  carrier: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber?: string;
  cost: number;
}

// 3. Restaurant & Dining Extension Point
export interface DiningReservation {
  id: string;
  restaurantName: string;
  reservationTime: string;
  partySize: number;
  cuisineType?: string;
  costEstimate?: number;
  coordinates?: { lat: number; lng: number };
}

// 4. Attractions & Bookings Extension Point
export interface TicketBooking {
  id: string;
  attractionName: string;
  ticketType: string;
  validDate: string;
  validTime?: string;
  qrCodeUrl?: string;
  cost: number;
}

// 5. Shared Trips & Collaboration Extension Point
export interface Collaborator {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "owner" | "editor" | "viewer";
}

export interface CollaborationSession {
  tripId: string;
  activeUsers: Collaborator[];
  syncStatus: "synced" | "syncing" | "offline";
}

// 6. Live Traffic & Offline Maps Extension Point
export interface TrafficConditions {
  segmentId: string;
  delayMinutes: number;
  congestionLevel: "none" | "light" | "heavy" | "gridlock";
}

export interface OfflineMapPackage {
  regionId: string;
  packageName: string;
  sizeMb: number;
  downloadStatus: "not_downloaded" | "downloading" | "downloaded";
}

// 7. Emergency Services Extension Point
export interface LocalEmergencyContacts {
  police: string;
  medical: string;
  fire: string;
  embassyPhone?: string;
  nearestHospital?: {
    name: string;
    phone: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
}

// 8. Currency Intelligence Extension Point
export interface ExchangeRateTable {
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

// 9. Global Notification Center Extension Point
export interface TravelNotification {
  id: string;
  type: "flight_delay" | "weather_alert" | "budget_warning" | "general";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
