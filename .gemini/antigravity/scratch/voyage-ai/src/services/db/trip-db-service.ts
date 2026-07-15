import { supabase } from "@/lib/supabase";
import { Trip, Activity, ExpenseItem } from "@/features/timeline/types";
import { VoyageLogger } from "@/lib/logger";

export interface TripShare {
  id?: string;
  tripId: string;
  sharedWithEmail: string;
  accessMode: "view" | "edit" | "comment";
  createdAt?: string;
}

export interface TripVersion {
  tripId: string;
  version: number;
  tripData: any;
  createdAt: string;
}

export class TripDBService {
  private static getLocalTrips(userId: string): any[] {
    if (typeof window === "undefined") return [];
    const key = `voyage_trips_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }

  private static saveLocalTrips(userId: string, trips: any[]) {
    if (typeof window === "undefined") return;
    const key = `voyage_trips_${userId}`;
    localStorage.setItem(key, JSON.stringify(trips));
  }

  private static getLocalVersions(tripId: string): TripVersion[] {
    if (typeof window === "undefined") return [];
    const key = `voyage_versions_${tripId}`;
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }

  private static saveLocalVersion(tripId: string, version: TripVersion) {
    if (typeof window === "undefined") return;
    const key = `voyage_versions_${tripId}`;
    const current = this.getLocalVersions(tripId);
    current.push(version);
    localStorage.setItem(key, JSON.stringify(current.slice(-10))); // Limit to last 10 versions
  }

  static async fetchUserTrips(userId: string): Promise<any[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    
    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Fetching trips from Supabase for user: ${userId}`);
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("userId", userId)
          .neq("status", "deleted")
          .order("updatedAt", { ascending: false });

        if (error) {
          VoyageLogger.error("DB", `Supabase fetch error: ${error.message}`);
        } else if (data) {
          // Reconstruct each trip by fetching its normalized sub-components
          const fullyPopulatedTrips = await Promise.all(data.map(async (trip: any) => {
            const days = await this.fetchTripDaysAndActivities(trip.id);
            const expenses = await this.fetchTripExpenses(trip.id);
            return {
              ...trip,
              timeline: days,
              finance: {
                totalBudget: trip.totalBudget || 0,
                currency: trip.currency || "USD",
                manualExpenses: expenses
              }
            };
          }));

          this.saveLocalTrips(userId, fullyPopulatedTrips);
          return fullyPopulatedTrips;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase fetch exception, falling back to LocalStorage`);
      }
    }
    
    VoyageLogger.info("DB", `Fetching trips from LocalStorage for user: ${userId}`);
    return this.getLocalTrips(userId).filter(t => t.status !== "deleted");
  }

  // Fetch sub-elements (days and activities) for a trip
  private static async fetchTripDaysAndActivities(tripId: string): Promise<any[]> {
    try {
      if (!supabase) return [];
      const { data: days, error: daysErr } = await supabase
        .from("trip_days")
        .select("*")
        .eq("tripId", tripId)
        .order("dayNumber", { ascending: true });

      if (daysErr || !days) return [];

      const { data: activities, error: actErr } = await supabase
        .from("activities")
        .select("*")
        .eq("tripId", tripId)
        .order("time", { ascending: true });

      if (actErr || !activities) return [];

      // Nest activities into their respective days
      return days.map(day => ({
        day: day.dayNumber,
        title: day.title,
        dayNumber: day.dayNumber,
        activities: activities
          .filter((act: any) => act.dayNumber === day.dayNumber)
          .map((act: any) => ({
            id: act.id,
            time: act.time,
            title: act.title,
            description: act.description,
            cost: act.cost,
            category: act.category,
            openingHours: act.openingHours,
            visitDuration: act.visitDuration,
            arrivalTime: act.arrivalTime,
            departureTime: act.departureTime,
            waitingTime: act.waitingTime,
            crowdIndicator: act.crowdIndicator,
            rating: act.rating,
            ticketPrice: act.ticketPrice,
            bookingRequired: act.bookingRequired,
            address: act.address,
            website: act.website,
            accessibility: act.accessibility,
            nearbyRecommendations: act.nearbyRecommendations,
            travelTime: act.travelTime,
            distance: act.distance,
            coordinates: act.coordinates ? JSON.parse(act.coordinates) : undefined,
            googleRating: act.googleRating,
            googleReviewsCount: act.googleReviewsCount,
            images: act.images ? JSON.parse(act.images) : [],
            bookingUrl: act.bookingUrl
          }))
      }));
    } catch (e) {
      return [];
    }
  }

  private static async fetchTripExpenses(tripId: string): Promise<any[]> {
    try {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("tripId", tripId);

      if (error || !data) return [];
      return data.map(exp => ({
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        receiptUrl: exp.receiptUrl
      }));
    } catch (e) {
      return [];
    }
  }

  static async saveTrip(
    userId: string, 
    trip: Trip, 
    companionType: string, 
    budget: string, 
    travelStyle: string, 
    interests: string[], 
    status: "draft" | "active" | "completed" | "archived" | "deleted" = "draft"
  ): Promise<void> {
    const now = new Date().toISOString();
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    const payload = {
      id: trip.id,
      userId,
      title: trip.name || `Journey to ${trip.destination}`,
      destination: trip.destination,
      duration: trip.days.length,
      travelerCount: trip.travelerCount,
      companionType,
      budget,
      travelStyle,
      interests,
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      status: status || trip.status || "draft",
      version: trip.version || 1,
      updatedAt: now,
      lastOpenedAt: now
    };

    // Save version history snapshot
    const versionSnapshot: TripVersion = {
      tripId: trip.id,
      version: trip.version || 1,
      tripData: JSON.parse(JSON.stringify(trip)),
      createdAt: now
    };
    this.saveLocalVersion(trip.id, versionSnapshot);

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Saving normalized trip ${trip.id} to Supabase...`);
        
        // 1. Upsert parent trip row
        const { error: tripErr } = await supabase
          .from("trips")
          .upsert({ ...payload, createdAt: now }, { onConflict: "id" });
        if (tripErr) throw tripErr;

        // 2. Delete and insert normalized days
        await supabase.from("trip_days").delete().eq("tripId", trip.id);
        const dayRows = trip.days.map(day => ({
          tripId: trip.id,
          dayNumber: day.dayNumber,
          title: day.title || `Day ${day.dayNumber}`
        }));
        await supabase.from("trip_days").insert(dayRows);

        // 3. Delete and insert activities
        await supabase.from("activities").delete().eq("tripId", trip.id);
        const actRows = trip.days.flatMap(day => 
          day.activities.map(act => ({
            id: act.id,
            tripId: trip.id,
            dayNumber: day.dayNumber,
            time: act.time,
            title: act.title,
            description: act.description,
            cost: act.cost,
            category: act.category,
            openingHours: act.openingHours,
            visitDuration: act.visitDuration,
            arrivalTime: act.arrivalTime,
            departureTime: act.departureTime,
            waitingTime: act.waitingTime,
            crowdIndicator: act.crowdIndicator,
            rating: act.rating,
            ticketPrice: act.ticketPrice,
            bookingRequired: act.bookingRequired,
            address: act.address,
            website: act.website,
            accessibility: act.accessibility,
            nearbyRecommendations: act.nearbyRecommendations,
            travelTime: act.travelTime,
            distance: act.distance,
            coordinates: act.coordinates ? JSON.stringify(act.coordinates) : null,
            googleRating: act.googleRating,
            googleReviewsCount: act.googleReviewsCount,
            images: act.images ? JSON.stringify(act.images) : null,
            bookingUrl: act.bookingUrl
          }))
        );
        if (actRows.length > 0) {
          await supabase.from("activities").insert(actRows);
        }

        // 4. Delete and insert expenses
        await supabase.from("expenses").delete().eq("tripId", trip.id);
        const expRows = (trip.manualExpenses || []).map(exp => ({
          id: exp.id,
          tripId: trip.id,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
          receiptUrl: exp.receiptUrl
        }));
        if (expRows.length > 0) {
          await supabase.from("expenses").insert(expRows);
        }

        // 5. Store snapshot in trip_versions table
        await supabase.from("trip_versions").insert({
          tripId: trip.id,
          version: trip.version || 1,
          tripData: JSON.parse(JSON.stringify(trip)),
          createdAt: now
        });

      } catch (err: any) {
        VoyageLogger.error("DB", `Supabase normalized save error: ${err.message}`);
      }
    }

    // Save to Local Cache
    const localPayload = {
      ...payload,
      timeline: trip.days,
      finance: {
        totalBudget: trip.totalBudget,
        currency: trip.currency,
        manualExpenses: trip.manualExpenses
      },
      createdAt: now
    };
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = { ...trips[idx], ...localPayload };
    } else {
      trips.push(localPayload);
    }
    this.saveLocalTrips(userId, trips);
  }

  // --- Version Control Restorations ---
  static async fetchVersions(tripId: string): Promise<TripVersion[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        const { data, error } = await supabase
          .from("trip_versions")
          .select("*")
          .eq("tripId", tripId)
          .order("version", { ascending: false });

        if (!error && data) return data;
      } catch (e) {}
    }
    return this.getLocalVersions(tripId);
  }

  // --- Sharing Accessors ---
  static async fetchShares(tripId: string): Promise<TripShare[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        const { data, error } = await supabase
          .from("trip_shares")
          .select("*")
          .eq("tripId", tripId);

        if (!error && data) return data;
      } catch (e) {}
    }
    return [];
  }

  static async shareTrip(tripId: string, sharedWithEmail: string, accessMode: "view" | "edit" | "comment"): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("trip_shares")
          .upsert({
            tripId,
            sharedWithEmail,
            accessMode,
            createdAt: new Date().toISOString()
          }, { onConflict: "tripId,sharedWithEmail" });
      } catch (e) {}
    }
  }

  // Standard commands fallbacks
  static async deleteTrip(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("trips")
          .update({ status: "deleted", updatedAt: new Date().toISOString() })
          .eq("id", tripId)
          .eq("userId", userId);
      } catch (e) {}
    }
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].status = "deleted";
      this.saveLocalTrips(userId, trips);
    }
  }

  static async archiveTrip(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("trips")
          .update({ status: "archived", updatedAt: new Date().toISOString() })
          .eq("id", tripId)
          .eq("userId", userId);
      } catch (e) {}
    }
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].status = "archived";
      this.saveLocalTrips(userId, trips);
    }
  }

  static async duplicateTrip(userId: string, tripId: string): Promise<void> {
    const trips = this.getLocalTrips(userId);
    const existing = trips.find(t => t.id === tripId);
    if (!existing) throw new Error("Trip not found");

    const newId = `trip-dup-${Date.now()}`;
    const duplicate = {
      ...existing,
      id: newId,
      title: `${existing.title || "Trip"} (Copy)`,
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    trips.push(duplicate);
    this.saveLocalTrips(userId, trips);

    // Sync if online
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await this.saveTrip(
          userId,
          {
            id: newId,
            name: duplicate.title,
            destination: duplicate.destination,
            startDate: duplicate.travelMetadata?.startDate || "",
            endDate: duplicate.travelMetadata?.endDate || "",
            travelerCount: duplicate.travelerCount || 1,
            days: duplicate.timeline || [],
            totalBudget: duplicate.finance?.totalBudget || 0,
            currency: duplicate.finance?.currency || "USD",
            manualExpenses: duplicate.finance?.manualExpenses || [],
            version: 1,
            status: "draft"
          },
          duplicate.companionType,
          duplicate.budget,
          duplicate.travelStyle,
          duplicate.interests
        );
      } catch (e) {}
    }
  }

  static async renameTrip(userId: string, tripId: string, newName: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("trips")
          .update({ title: newName, updatedAt: new Date().toISOString() })
          .eq("id", tripId)
          .eq("userId", userId);
      } catch (e) {}
    }

    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].title = newName;
      trips[idx].updatedAt = new Date().toISOString();
      this.saveLocalTrips(userId, trips);
    }
  }

  static async updateLastOpened(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    const now = new Date().toISOString();
    if (supabase && isOnline) {
      try {
        await supabase.from("trips").update({ lastOpenedAt: now }).eq("id", tripId).eq("userId", userId);
      } catch (e) {}
    }
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].lastOpenedAt = now;
      this.saveLocalTrips(userId, trips);
    }
  }

  static async syncOfflineTrips(userId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (!supabase || !isOnline) return;

    const localTrips = this.getLocalTrips(userId);
    for (const trip of localTrips) {
      try {
        await this.saveTrip(
          userId,
          {
            id: trip.id,
            name: trip.title || trip.travelMetadata?.name,
            destination: trip.destination,
            startDate: trip.travelMetadata?.startDate || "",
            endDate: trip.travelMetadata?.endDate || "",
            travelerCount: trip.travelerCount || 1,
            days: trip.timeline || [],
            totalBudget: trip.finance?.totalBudget || 0,
            currency: trip.finance?.currency || "USD",
            manualExpenses: trip.finance?.manualExpenses || [],
            version: trip.version || 1,
            status: trip.status || "draft"
          },
          trip.companionType,
          trip.budget,
          trip.travelStyle,
          trip.interests,
          trip.status
        );
      } catch (e) {}
    }
  }
}
