import { supabase } from "@/lib/supabase";
import { Trip } from "@/features/timeline/types";
import { VoyageLogger } from "@/lib/logger";

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

  static async fetchUserTrips(userId: string): Promise<any[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    
    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Fetching trips from Supabase for user: ${userId}`);
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("userId", userId)
          .neq("status", "deleted") // Filter out soft-deleted trips
          .order("updatedAt", { ascending: false });

        if (error) {
          VoyageLogger.error("DB", `Supabase fetch error: ${error.message}`);
        } else if (data) {
          // Sync local storage cache
          this.saveLocalTrips(userId, data);
          return data;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase fetch exception, falling back to LocalStorage`);
      }
    }
    
    VoyageLogger.info("DB", `Fetching trips from LocalStorage for user: ${userId}`);
    // Filter out soft-deleted trips from local cache too
    return this.getLocalTrips(userId).filter(t => t.status !== "deleted");
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
      timeline: trip.days,
      finance: {
        totalBudget: trip.totalBudget,
        currency: trip.currency,
        manualExpenses: trip.manualExpenses
      },
      travelMetadata: {
        startDate: trip.startDate,
        endDate: trip.endDate,
        name: trip.name
      },
      status: status || trip.status || "draft",
      version: trip.version || 1,
      updatedAt: now,
      lastOpenedAt: now
    };

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Saving trip ${trip.id} (v${payload.version}) to Supabase for user: ${userId}`);
        const { error } = await supabase
          .from("trips")
          .upsert({ ...payload, createdAt: now }, { onConflict: "id" });

        if (error) {
          VoyageLogger.error("DB", `Supabase save error: ${error.message}`);
          throw error;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase save exception, falling back to LocalStorage`);
        // We will fallback to LocalStorage on exception
      }
    }

    VoyageLogger.info("DB", `Saving trip ${trip.id} (v${payload.version}) to LocalStorage for user: ${userId}`);
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = { ...trips[idx], ...payload };
    } else {
      trips.push({ ...payload, createdAt: now });
    }
    this.saveLocalTrips(userId, trips);
  }

  static async deleteTrip(userId: string, tripId: string): Promise<void> {
    // Soft delete
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Soft-deleting trip ${tripId} in Supabase`);
        const { error } = await supabase
          .from("trips")
          .update({ status: "deleted", updatedAt: new Date().toISOString() })
          .eq("id", tripId)
          .eq("userId", userId);

        if (error) {
          VoyageLogger.error("DB", `Supabase delete error: ${error.message}`);
          throw error;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase delete exception, falling back to LocalStorage`);
      }
    }

    VoyageLogger.info("DB", `Soft-deleting trip ${tripId} in LocalStorage`);
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].status = "deleted";
      trips[idx].updatedAt = new Date().toISOString();
      this.saveLocalTrips(userId, trips);
    }
  }

  static async archiveTrip(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Archiving trip ${tripId} in Supabase`);
        const { error } = await supabase
          .from("trips")
          .update({ status: "archived", updatedAt: new Date().toISOString() })
          .eq("id", tripId)
          .eq("userId", userId);

        if (error) {
          VoyageLogger.error("DB", `Supabase archive error: ${error.message}`);
          throw error;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase archive exception, falling back to LocalStorage`);
      }
    }

    VoyageLogger.info("DB", `Archiving trip ${tripId} in LocalStorage`);
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].status = "archived";
      trips[idx].updatedAt = new Date().toISOString();
      this.saveLocalTrips(userId, trips);
    }
  }

  static async duplicateTrip(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    const trips = this.getLocalTrips(userId);
    const existingLocal = trips.find(t => t.id === tripId);

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Duplicating trip ${tripId} in Supabase`);
        const { data: existing, error: fetchErr } = await supabase
          .from("trips")
          .select("*")
          .eq("id", tripId)
          .eq("userId", userId)
          .single();

        if (!fetchErr && existing) {
          const newId = `trip-dup-${Date.now()}`;
          const duplicate = {
            ...existing,
            id: newId,
            title: `${existing.title || "Trip"} (Copy)`,
            travelMetadata: {
              ...(existing.travelMetadata || {}),
              name: `${existing.travelMetadata?.name || "Trip"} (Copy)`
            },
            status: "draft",
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastOpenedAt: new Date().toISOString()
          };

          const { error: saveErr } = await supabase.from("trips").insert(duplicate);
          if (!saveErr) {
            // Update local cache
            const updatedTrips = [...trips, duplicate];
            this.saveLocalTrips(userId, updatedTrips);
            return;
          }
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase duplicate exception, falling back to LocalStorage`);
      }
    }

    VoyageLogger.info("DB", `Duplicating trip ${tripId} in LocalStorage`);
    if (!existingLocal) throw new Error("Trip not found");

    const duplicate = {
      ...existingLocal,
      id: `trip-dup-${Date.now()}`,
      title: `${existingLocal.title || "Trip"} (Copy)`,
      travelMetadata: {
        ...(existingLocal.travelMetadata || {}),
        name: `${existingLocal.travelMetadata?.name || "Trip"} (Copy)`
      },
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString()
    };
    trips.push(duplicate);
    this.saveLocalTrips(userId, trips);
  }

  static async renameTrip(userId: string, tripId: string, newName: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Renaming trip ${tripId} in Supabase to: ${newName}`);
        const { data: existing, error: fetchErr } = await supabase
          .from("trips")
          .select("travelMetadata")
          .eq("id", tripId)
          .single();

        if (!fetchErr) {
          const updatedMetadata = {
            ...(existing?.travelMetadata || {}),
            name: newName
          };

          const { error } = await supabase
            .from("trips")
            .update({ 
              title: newName,
              travelMetadata: updatedMetadata, 
              updatedAt: new Date().toISOString() 
            })
            .eq("id", tripId)
            .eq("userId", userId);

          if (error) throw error;
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase rename exception, falling back to LocalStorage`);
      }
    }

    VoyageLogger.info("DB", `Renaming trip ${tripId} in LocalStorage to: ${newName}`);
    const trips = this.getLocalTrips(userId);
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx].title = newName;
      trips[idx].travelMetadata = {
        ...(trips[idx].travelMetadata || {}),
        name: newName
      };
      trips[idx].updatedAt = new Date().toISOString();
      this.saveLocalTrips(userId, trips);
    }
  }

  static async updateLastOpened(userId: string, tripId: string): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    const now = new Date().toISOString();

    if (supabase && isOnline) {
      try {
        await supabase
          .from("trips")
          .update({ lastOpenedAt: now })
          .eq("id", tripId)
          .eq("userId", userId);
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
    if (localTrips.length === 0) return;
    
    VoyageLogger.info("DB", `Syncing ${localTrips.length} local cache/offline trips to Supabase...`);
    for (const trip of localTrips) {
      try {
        await supabase
          .from("trips")
          .upsert({
            id: trip.id,
            userId: trip.userId,
            title: trip.title || trip.travelMetadata?.name || `Journey to ${trip.destination}`,
            destination: trip.destination,
            duration: trip.duration,
            travelerCount: trip.travelerCount,
            companionType: trip.companionType,
            budget: trip.budget,
            travelStyle: trip.travelStyle,
            interests: trip.interests,
            timeline: trip.timeline,
            finance: trip.finance,
            travelMetadata: trip.travelMetadata,
            status: trip.status || 'draft',
            version: trip.version || 1,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
            lastOpenedAt: trip.lastOpenedAt
          }, { onConflict: "id" });
      } catch (error) {
        VoyageLogger.error("DB", `Failed to sync offline trip ${trip.id}`);
      }
    }
  }
}
