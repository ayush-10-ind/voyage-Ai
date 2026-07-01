import { supabase } from "@/lib/supabase";
import { VoyageLogger } from "@/lib/logger";

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  avatar: string;
  preferences: Record<string, any>;
  lastLogin: string;
}

export class ProfileDBService {
  private static getLocalProfile(userId: string): UserProfile | null {
    if (typeof window === "undefined") return null;
    const key = `voyage_profile_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }

  private static saveLocalProfile(userId: string, profile: UserProfile) {
    if (typeof window === "undefined") return;
    const key = `voyage_profile_${userId}`;
    localStorage.setItem(key, JSON.stringify(profile));
  }

  static async syncProfile(
    userId: string,
    profileData: { fullName: string; email: string; avatar: string }
  ): Promise<UserProfile> {
    const lastLogin = new Date().toISOString();
    const existing = await this.getProfile(userId);
    
    const profile: UserProfile = {
      userId,
      fullName: profileData.fullName,
      email: profileData.email,
      avatar: profileData.avatar,
      preferences: existing?.preferences || {},
      lastLogin
    };

    if (supabase) {
      VoyageLogger.info("DB", `Syncing profile to Supabase for user: ${userId}`);
      const { error } = await supabase
        .from("profiles")
        .upsert({
          userId,
          fullName: profileData.fullName,
          email: profileData.email,
          avatar: profileData.avatar,
          lastLogin,
          updatedAt: lastLogin
        }, { onConflict: "userId" });

      if (error) {
        VoyageLogger.error("DB", `Supabase profile sync error: ${error.message}`);
      }
    }

    VoyageLogger.info("DB", `Syncing profile to LocalStorage for user: ${userId}`);
    this.saveLocalProfile(userId, profile);
    return profile;
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (supabase) {
      try {
        VoyageLogger.info("DB", `Fetching profile from Supabase for user: ${userId}`);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("userId", userId)
          .single();

        if (error) {
          VoyageLogger.error("DB", `Supabase profile fetch error: ${error.message}`);
        } else if (data) {
          return {
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
            avatar: data.avatar,
            preferences: data.preferences || {},
            lastLogin: data.lastLogin
          };
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase profile fetch exception`);
      }
    }
    
    return this.getLocalProfile(userId);
  }

  static async updatePreferences(userId: string, preferences: Record<string, any>): Promise<void> {
    const existing = await this.getProfile(userId);
    const updatedPrefs = { ...(existing?.preferences || {}), ...preferences };

    if (supabase) {
      try {
        VoyageLogger.info("DB", `Updating preferences in Supabase for user: ${userId}`);
        const { error } = await supabase
          .from("profiles")
          .update({
            preferences: updatedPrefs,
            updatedAt: new Date().toISOString()
          })
          .eq("userId", userId);

        if (error) {
          VoyageLogger.error("DB", `Supabase preferences update error: ${error.message}`);
        }
      } catch (err) {
        VoyageLogger.error("DB", `Supabase preferences update exception`);
      }
    }

    // Always update locally as fallback/cache
    const profile = existing || {
      userId,
      fullName: "",
      email: "",
      avatar: "",
      preferences: {},
      lastLogin: new Date().toISOString()
    };
    profile.preferences = updatedPrefs;
    this.saveLocalProfile(userId, profile);
  }
}
