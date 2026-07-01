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
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { TripDBService } from "@/services/db/trip-db-service";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { VoyageLogger } from "@/lib/logger";

export default function TripsPage() {
  return (
    <ProtectedRoute>
      <TripsContent />
    </ProtectedRoute>
  );
}

function TripsContent() {
  const { user } = useUserContext();
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("active");

  // Rename Dialog State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeRenameTripId, setActiveRenameTripId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const loadTrips = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await TripDBService.fetchUserTrips(user.id);
      setTrips(data);
    } catch (err) {
      console.error("Failed to load trips", err);
      toast.error("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  const handleOpenTrip = (targetTrip: any) => {
    VoyageLogger.info("Navigation", `Opening saved trip: ${targetTrip.id}`);
    useTimelineStore.getState().loadTripFromDB(targetTrip);
    useCopilotStore.getState().loadFromSavedTrip(targetTrip);
    
    // Update last opened
    if (user?.id) {
      TripDBService.updateLastOpened(user.id, targetTrip.id);
    }
    
    router.push("/planner");
  };

  const handleDuplicateTrip = async (tripId: string) => {
    if (!user?.id) return;
    try {
      toast.info("Duplicating trip...");
      await TripDBService.duplicateTrip(user.id, tripId);
      toast.success("Trip duplicated successfully!");
      loadTrips();
    } catch (err) {
      console.error("Failed to duplicate trip", err);
      toast.error("Failed to duplicate trip.");
    }
  };

  const handleRenameClick = (tripId: string, currentTitle: string) => {
    setActiveRenameTripId(tripId);
    setRenameValue(currentTitle);
    setIsRenameOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!user?.id || !activeRenameTripId || !renameValue.trim()) return;
    try {
      await TripDBService.renameTrip(user.id, activeRenameTripId, renameValue.trim());
      toast.success("Trip renamed successfully!");
      setIsRenameOpen(false);
      loadTrips();
    } catch (err) {
      console.error("Failed to rename trip", err);
      toast.error("Failed to rename trip.");
    }
  };

  const handleArchiveTrip = async (tripId: string) => {
    if (!user?.id) return;
    try {
      await TripDBService.archiveTrip(user.id, tripId);
      toast.success("Trip archived successfully!");
      loadTrips();
    } catch (err) {
      console.error("Failed to archive trip", err);
      toast.error("Failed to archive trip.");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.id) return;
    try {
      await TripDBService.deleteTrip(user.id, tripId);
      toast.success("Trip deleted successfully!");
      loadTrips();
    } catch (err) {
      console.error("Failed to delete trip", err);
      toast.error("Failed to delete trip.");
    }
  };

  // Filter trips based on activeTab
  const filteredTrips = trips.filter((t) => {
    if (activeTab === "all") return t.status !== "deleted";
    if (activeTab === "active") return t.status !== "deleted" && t.status !== "archived";
    if (activeTab === "archived") return t.status === "archived";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070b19] to-[#02040a] text-white flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-black text-lg tracking-tight hover:opacity-80 transition-opacity">
          <Icons.explore className="h-5 w-5 text-primary" />
          Voyage AI
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold hover:bg-white/5 text-zinc-300 hover:text-white">
            <Icons.chevronLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-start items-start gap-8 z-10 text-left relative">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2 text-left">
            <Typography variant="title" className="text-3xl font-black font-heading tracking-tight text-white">
              My Trips
            </Typography>
            <p className="text-sm text-zinc-400">
              Manage and command your generated cloud itineraries.
            </p>
          </div>

          <Link href="/planner">
            <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white glow-primary px-5 h-10">
              <Icons.plus className="h-4 w-4 mr-1.5" />
              New Trip
            </Button>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-white/5 w-full gap-6 text-sm font-semibold text-zinc-500 pb-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-2 transition-colors relative ${activeTab === "active" ? "text-white" : "hover:text-zinc-300"}`}
          >
            Active & Drafts
            {activeTab === "active" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`pb-2 transition-colors relative ${activeTab === "archived" ? "text-white" : "hover:text-zinc-300"}`}
          >
            Archived
            {activeTab === "archived" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 transition-colors relative ${activeTab === "all" ? "text-white" : "hover:text-zinc-300"}`}
          >
            All Trips
            {activeTab === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} padding="lg" className="animate-pulse h-48 bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredTrips.map((t) => (
              <GlassCard key={t.id} padding="lg" className="border-glow bg-white/5 flex flex-col justify-between min-h-[200px] relative group text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {t.status || "Draft"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      v{t.version || 1}
                    </span>
                  </div>
                  <div>
                    <Typography variant="body" className="font-bold text-white text-base leading-snug line-clamp-1">
                      {t.title || `Journey to ${t.destination}`}
                    </Typography>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <Icons.destination className="h-3.5 w-3.5 text-secondary" />
                      {t.destination}
                    </p>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-400">
                    <p className="flex items-center gap-1.5">
                      <Icons.calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {t.duration} Days • {t.travelerCount || 1} Guest{t.travelerCount > 1 ? "s" : ""}
                    </p>
                    {t.lastOpenedAt && (
                      <p className="text-zinc-500">
                        Opened: {new Date(t.lastOpenedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenTrip(t)} 
                    className="flex-1 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white glow-primary h-8"
                  >
                    Open
                  </Button>
                  
                  {/* Actions Dropdown / Option Row */}
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDuplicateTrip(t.id)}
                      className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      title="Duplicate"
                    >
                      <Icons.plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRenameClick(t.id, t.title || `Journey to ${t.destination}`)}
                      className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      title="Rename"
                    >
                      <Icons.edit className="h-3.5 w-3.5" />
                    </Button>
                    {t.status !== "archived" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleArchiveTrip(t.id)}
                        className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        title="Archive"
                      >
                        <Icons.calendar className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteTrip(t.id)}
                      className="h-8 w-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete"
                    >
                      <Icons.trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard padding="lg" className="border-glow bg-white/5 w-full flex flex-col items-center justify-center text-center py-16 gap-3">
            <Icons.calendar className="h-10 w-10 text-zinc-700" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No Trips Found</p>
              <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                There are no trips matching your selected filter. Start planning a new itinerary now!
              </p>
            </div>
            <Link href="/planner" className="mt-2">
              <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white glow-primary px-5">
                Plan a New Trip
              </Button>
            </Link>
          </GlassCard>
        )}
      </main>

      {/* Custom Glass Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="border border-white/10 bg-[#070b19]/90 text-white backdrop-blur-xl rounded-2xl p-5 w-full max-w-xs shadow-2xl z-50">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Icons.edit className="h-4 w-4 text-primary" />
              Rename Trip
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-1">
              Enter a new title for your trip.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <Input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-zinc-500 rounded-xl h-10 text-xs focus:border-primary/50"
              placeholder="e.g. Japan Spring Tour"
              autoFocus
            />
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRenameOpen(false)}
              className="rounded-xl text-xs hover:bg-white/5 text-zinc-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRenameConfirm}
              className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-white font-semibold glow-primary"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
