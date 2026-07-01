"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/features/auth/context/user-context";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { TripDBService } from "@/services/db/trip-db-service";
import { toast } from "sonner";
import { VoyageLogger } from "@/lib/logger";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useUserContext();
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual trips from DB
  const loadTrips = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await TripDBService.fetchUserTrips(user.id);
      setTrips(data);
    } catch (err) {
      console.error("Failed to load user trips", err);
      toast.error("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    router.push("/");
  };

  // Compute travel statistics
  const tripsCount = trips.length;
  
  // Calculate unique countries/destinations
  const countriesCount = new Set(
    trips
      .filter((t) => t.destination)
      .map((t) => t.destination.toLowerCase().trim())
  ).size;

  // Calculate total travel days
  const totalTravelDays = trips.reduce((sum, t) => sum + (t.duration || 0), 0);

  // Calculate average budget
  const validBudgets = trips
    .map((t) => t.finance?.totalBudget || 0)
    .filter((b) => b > 0);
  const avgBudgetVal = validBudgets.length > 0 
    ? Math.round(validBudgets.reduce((sum, b) => sum + b, 0) / validBudgets.length) 
    : 0;
  const averageBudgetFormatted = avgBudgetVal > 0 ? `$${avgBudgetVal.toLocaleString()}` : "$0";

  // Get most recently updated trip for "Continue Planning" quick action
  const latestTrip = trips.length > 0 ? trips[0] : null;

  const handleOpenTrip = (targetTrip: any) => {
    VoyageLogger.info("Navigation", `Opening saved trip: ${targetTrip.id}`);
    useTimelineStore.getState().loadTripFromDB(targetTrip);
    useCopilotStore.getState().loadFromSavedTrip(targetTrip);
    
    // Update last opened in background
    if (user?.id) {
      TripDBService.updateLastOpened(user.id, targetTrip.id);
    }
    
    router.push("/planner");
  };

  const handleCreateNewTrip = () => {
    VoyageLogger.info("Navigation", "Initiating fresh trip planning sequence");
    useTimelineStore.getState().clearTrip();
    useCopilotStore.getState().resetCopilot();
    router.push("/planner");
  };

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] text-white flex flex-col relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight hover:opacity-80 transition-opacity">
          <Icons.explore className="h-5 w-5 text-primary" />
          Voyage AI
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <Link href="/dashboard" className="text-white">Dashboard</Link>
          <Link href="/trips" className="hover:text-white transition-colors">My Trips</Link>
          <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 hidden sm:inline">
            {user?.email}
          </span>
          <img
            src={user?.image || ""}
            alt={user?.name || "Avatar"}
            className="h-8 w-8 rounded-full border border-white/10"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="rounded-xl text-xs font-semibold hover:bg-rose-500/10 text-rose-400 hover:text-rose-300"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 text-left items-start">
        {/* Left column: Welcome, Quick Actions, Recent Trips */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Banner */}
          <div className="space-y-2">
            <Typography variant="title" className="text-3xl md:text-4xl font-black font-heading tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name || "Explorer"}</span>
            </Typography>
            <p className="text-sm text-zinc-400">
              Your personalized cloud travel command center is ready. Where are we heading next?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Typography variant="body" className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Quick Actions
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div onClick={handleCreateNewTrip}>
                <GlassCard padding="md" className="border-glow bg-primary/5 hover:bg-primary/10 transition-colors h-full flex flex-col justify-between items-start gap-5 cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icons.plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">New Trip</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Start the AI Copilot</p>
                  </div>
                </GlassCard>
              </div>

              <div 
                onClick={() => latestTrip ? handleOpenTrip(latestTrip) : toast.info("No saved trips yet. Start a new one!")}
                className={!latestTrip ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              >
                <GlassCard
                  padding="md"
                  className="border-glow bg-white/5 hover:bg-white/10 transition-colors h-full flex flex-col justify-between items-start gap-5"
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                    <Icons.calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Continue Planning</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {latestTrip ? latestTrip.destination : "No active trip"}
                    </p>
                  </div>
                </GlassCard>
              </div>

              <Link href="/trips">
                <GlassCard padding="md" className="border-glow bg-white/5 hover:bg-white/10 transition-colors h-full flex flex-col justify-between items-start gap-5 cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icons.explore className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">My Trips</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">View & manage all saved trips</p>
                  </div>
                </GlassCard>
              </Link>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="space-y-3">
            <Typography variant="body" className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Recent Trips
            </Typography>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <GlassCard key={i} padding="md" className="animate-pulse h-24 bg-white/5 border border-white/5" />
                ))}
              </div>
            ) : tripsCount > 0 ? (
              <div className="space-y-4">
                {trips.slice(0, 3).map((t) => (
                  <GlassCard 
                    key={t.id} 
                    padding="md" 
                    onClick={() => handleOpenTrip(t)}
                    className="border-glow bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {t.status || "Draft"}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {t.duration} Days • {t.travelerCount || 1} Traveler{t.travelerCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{t.title || `Journey to ${t.destination}`}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <Icons.destination className="h-3 w-3 text-secondary" />
                        {t.destination}
                      </p>
                    </div>
                    <div className="text-left sm:text-right text-[10px] text-zinc-400 flex flex-col justify-center sm:items-end">
                      <p>Last opened: {t.lastOpenedAt ? new Date(t.lastOpenedAt).toLocaleDateString() : "Recently"}</p>
                      <p className="mt-0.5 text-zinc-500">Updated: {new Date(t.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard padding="lg" className="border-glow bg-white/5 flex flex-col items-center justify-center text-center py-12 gap-3">
                <Icons.info className="h-8 w-8 text-zinc-600" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">No Recent Trips</p>
                  <p className="text-[10px] text-zinc-400 max-w-[240px] leading-relaxed">
                    Generate an itinerary with the AI Copilot to start managing cloud trips.
                  </p>
                </div>
                <Button size="sm" onClick={handleCreateNewTrip} className="rounded-xl text-[10px] bg-primary hover:bg-primary/90 mt-2">
                  Create First Trip
                </Button>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Right column: Travel Statistics & Upcoming Trips */}
        <div className="space-y-8">
          {/* Travel Statistics */}
          <div className="space-y-3">
            <Typography variant="body" className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Travel Statistics
            </Typography>
            <GlassCard padding="md" className="border-glow bg-white/5 divide-y divide-white/5 space-y-4">
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Icons.explore className="h-4 w-4 text-primary" />
                  Trips Created
                </span>
                <span className="text-base font-black text-white">{tripsCount}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Icons.destination className="h-4 w-4 text-secondary" />
                  Countries Planned
                </span>
                <span className="text-base font-black text-white">{countriesCount}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Icons.calendar className="h-4 w-4 text-primary" />
                  Total Travel Days
                </span>
                <span className="text-base font-black text-white">{totalTravelDays}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Icons.budget className="h-4 w-4 text-emerald-400" />
                  Average Budget
                </span>
                <span className="text-base font-black text-emerald-400">{averageBudgetFormatted}</span>
              </div>
            </GlassCard>
          </div>

          {/* Upcoming Trips */}
          <div className="space-y-3">
            <Typography variant="body" className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Upcoming Trips
            </Typography>
            {!loading && tripsCount > 0 ? (
              <div className="space-y-2">
                {trips.slice(0, 2).map((t) => (
                  <GlassCard 
                    key={t.id} 
                    padding="md" 
                    onClick={() => handleOpenTrip(t)}
                    className="border-glow bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{t.title || `Journey to ${t.destination}`}</p>
                      <p className="text-[10px] text-zinc-400">
                        {t.travelMetadata?.startDate || "TBD"} - {t.travelMetadata?.endDate || "TBD"}
                      </p>
                    </div>
                    <Icons.chevronRight className="h-4 w-4 text-zinc-400" />
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard padding="lg" className="border-glow bg-white/5 flex flex-col items-center justify-center text-center py-10 gap-2">
                <Icons.calendar className="h-6 w-6 text-zinc-600" />
                <p className="text-[10px] text-zinc-400">No upcoming trips scheduled</p>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
