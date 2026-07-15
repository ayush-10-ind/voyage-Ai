import { supabase } from "@/lib/supabase";
import { VoyageLogger } from "@/lib/logger";

export class MemoryDBService {
  private static getLocalItem(key: string): any[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }

  private static saveLocalItem(key: string, data: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- AI Memory Service ---
  static async fetchAIMemory(userId: string): Promise<string[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Fetching AI Memory from Supabase for: ${userId}`);
        const { data, error } = await supabase
          .from("ai_memory")
          .select("preferences")
          .eq("userId", userId)
          .single();

        if (!error && data) return data.preferences || [];
      } catch (e) {}
    }
    return this.getLocalItem(`voyage_ai_memory_${userId}`);
  }

  static async saveAIMemory(userId: string, preferences: string[]): Promise<void> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    const cacheKey = `voyage_ai_memory_${userId}`;
    this.saveLocalItem(cacheKey, preferences);

    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Upserting AI Memory to Supabase for: ${userId}`);
        await supabase
          .from("ai_memory")
          .upsert({ userId, preferences, updatedAt: new Date().toISOString() }, { onConflict: "userId" });
      } catch (e) {}
    }
  }

  // --- Search History Service ---
  static async fetchSearchHistory(userId: string): Promise<string[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Fetching Search History from Supabase for: ${userId}`);
        const { data, error } = await supabase
          .from("search_history")
          .select("queries")
          .eq("userId", userId)
          .single();

        if (!error && data) return data.queries || [];
      } catch (e) {}
    }
    return this.getLocalItem(`voyage_search_history_${userId}`);
  }

  static async saveSearchQuery(userId: string, query: string): Promise<void> {
    const history = await this.fetchSearchHistory(userId);
    const updated = [query, ...history.filter(q => q !== query)].slice(0, 10);
    
    const cacheKey = `voyage_search_history_${userId}`;
    this.saveLocalItem(cacheKey, updated);

    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("search_history")
          .upsert({ userId, queries: updated, updatedAt: new Date().toISOString() }, { onConflict: "userId" });
      } catch (e) {}
    }
  }

  // --- Saved/Favorite Places Service ---
  static async fetchFavorites(userId: string): Promise<string[]> {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        VoyageLogger.info("DB", `Fetching Favorites from Supabase for: ${userId}`);
        const { data, error } = await supabase
          .from("favorites")
          .select("places")
          .eq("userId", userId)
          .single();

        if (!error && data) return data.places || [];
      } catch (e) {}
    }
    return this.getLocalItem(`voyage_favorites_${userId}`);
  }

  static async toggleFavorite(userId: string, placeName: string): Promise<void> {
    const favorites = await this.fetchFavorites(userId);
    const updated = favorites.includes(placeName)
      ? favorites.filter(p => p !== placeName)
      : [...favorites, placeName];

    const cacheKey = `voyage_favorites_${userId}`;
    this.saveLocalItem(cacheKey, updated);

    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    if (supabase && isOnline) {
      try {
        await supabase
          .from("favorites")
          .upsert({ userId, places: updated, updatedAt: new Date().toISOString() }, { onConflict: "userId" });
      } catch (e) {}
    }
  }
}
