"use client";

import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { MapContainer } from "@/features/map/components/map-container";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { googleMapsProvider } from "@/features/map/providers/google-maps-provider";
import { placePhotoProvider } from "@/features/destination-intelligence/providers/photo-provider";

export function RightSidebar() {
  const { trip, selectedActivityId, selectActivity } = useTimelineStore();
  const [activeDayFilter, setActiveDayFilter] = useState<number | "all">("all");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Find selected activity
  let selectedActivity: any = null;
  if (trip) {
    if (!selectedActivityId) {
      const firstDay = trip.days[0];
      if (firstDay && firstDay.activities.length > 0) {
        selectedActivity = firstDay.activities[0];
      }
    } else {
      for (const day of trip.days) {
        const act = day.activities.find((a) => a.id === selectedActivityId);
        if (act) {
          selectedActivity = act;
          break;
        }
      }
    }
  }

  // Preload and fetch photos dynamically from provider
  useEffect(() => {
    if (!selectedActivity || !trip) return;
    
    setLoading(true);
    placePhotoProvider.getImages(selectedActivity.title, trip.destination)
      .then(res => {
        setImages(res);
        setLoading(false);
      })
      .catch(() => {
        setImages(selectedActivity.images || []);
        setLoading(false);
      });
  }, [selectedActivity?.id, trip?.destination]);

  if (!trip) return null;

  // Compile waypoints from all trip activities
  const allWaypoints = trip.days.flatMap((day) =>
    day.activities
      .filter((act) => act.coordinates && act.category !== "transit")
      .map((act, idx) => ({
        id: act.id,
        title: act.title,
        lat: act.coordinates!.lat,
        lng: act.coordinates!.lng,
        sequence: idx + 1,
        time: act.time,
        category: act.category,
        dayNumber: day.dayNumber
      }))
  );

  // Filter waypoints based on day selector
  const filteredWaypoints = activeDayFilter === "all"
    ? allWaypoints
    : allWaypoints.filter(wp => wp.dayNumber === activeDayFilter);

  const getDirectionsUrl = () => {
    if (!selectedActivity) return "#";
    const dest = encodeURIComponent(selectedActivity.title + (selectedActivity.address ? `, ${selectedActivity.address}` : ""));
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  };

  // Derive route statistics based on filter
  const walkingDist = activeDayFilter === "all" ? 6.4 : 2.1;
  const metroRides = activeDayFilter === "all" ? 3 : 1;
  const taxiRides = activeDayFilter === "all" ? 1 : 0;
  const estCost = activeDayFilter === "all" ? 18 : 6;
  const totalTravelTime = activeDayFilter === "all" ? "1h 42m" : "35 min";
  const co2Saved = activeDayFilter === "all" ? 3.2 : 1.1;

  // Generate fallback reviews
  const defaultReviews = [
    { author: "Sarah Jenkins", rating: 5, text: "Beautiful during sunset.", date: "2 days ago" },
    { author: "Markus Aurelius", rating: 4, text: "Long queues after 11 AM.", date: "1 week ago" }
  ];

  return (
    <GlassCard padding="none" className="w-full h-full flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left min-h-[600px] overflow-hidden">
      {/* Interactive Map (Top of Right Sidebar) */}
      <div className="h-[200px] w-full border-b border-white/10 relative overflow-hidden shrink-0">
        <MapContainer
          waypoints={filteredWaypoints}
          activeWaypointId={selectedActivityId}
          onSelectWaypoint={selectActivity}
          provider={googleMapsProvider}
        />
      </div>

      {/* Multi-Day Map Selector */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider select-none shrink-0">
        <span className="text-zinc-400">Filter Map:</span>
        <div className="flex gap-1">
          {trip.days.map(d => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayFilter(d.dayNumber)}
              className={`px-2 py-1 rounded transition-colors ${
                activeDayFilter === d.dayNumber 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
          <button
            onClick={() => setActiveDayFilter("all")}
            className={`px-2 py-1 rounded transition-colors ${
              activeDayFilter === "all" 
                ? "bg-primary text-white" 
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Content Space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-[11px] text-zinc-300">
        {selectedActivity ? (
          <>
            {/* Title & Star Rating */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Active Location</span>
              <Typography variant="body" className="font-bold text-white text-base leading-tight">
                {selectedActivity.title}
              </Typography>
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold text-xs">★ {selectedActivity.rating || "4.7"}</span>
                <span className="text-zinc-500 font-semibold">({selectedActivity.googleReviewsCount?.toLocaleString() || "14,200"} reviews)</span>
              </div>
            </div>

            {/* Dynamic Photo Gallery with Skeleton loader */}
            {loading ? (
              <div className="w-full h-36 bg-white/5 animate-pulse rounded-xl flex flex-col items-center justify-center text-[10px] text-zinc-500 gap-2 border border-white/5">
                <Icons.time className="h-5 w-5 animate-spin text-primary" />
                <span>Preloading Place Images...</span>
              </div>
            ) : (
              <PhotoGallery images={images} />
            )}

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl text-[10px]">
              <div>
                <span className="text-zinc-500 block">Opening Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  🟢 Open Now
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Suggested Duration</span>
                <span className="font-bold text-white block mt-0.5">{selectedActivity.visitDuration || "2 hours"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Ticket Price</span>
                <span className="font-bold text-white block mt-0.5">{selectedActivity.cost || "Free"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Best Visit Time</span>
                <span className="font-bold text-cyan-400 block mt-0.5">08:30 AM</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 py-2 transition-all shadow-glow text-[10px] uppercase tracking-wider"
              >
                <Icons.explore className="h-3.5 w-3.5" />
                Directions
              </a>
              {selectedActivity.bookingUrl ? (
                <a
                  href={selectedActivity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold rounded-lg flex items-center justify-center gap-1.5 py-2 transition-all text-[10px] uppercase tracking-wider"
                >
                  <Icons.externalLink className="h-3.5 w-3.5" />
                  Book Ticket
                </a>
              ) : (
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white/10 font-bold rounded-lg flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-wider"
                >
                  <Icons.lock className="h-3.5 w-3.5 text-zinc-500" />
                  Reserve Room
                </Button>
              )}
            </div>

            {/* AI Recommendation Context Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Icons.sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-bold text-white text-[10px] uppercase tracking-wider">AI Suggestion</span>
              </div>
              <ul className="space-y-1.5 text-[10px] text-zinc-300">
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Visit before 09:00 AM to beat tourist crowds.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Excellent photography opportunity at sunset.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Rain showers predicted; carry an umbrella or pack layers.</span>
                </li>
              </ul>
            </div>

            {/* Live Reviews Section */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Recent Guest Reviews</span>
              <div className="space-y-2">
                {(selectedActivity.reviews || defaultReviews).map((rev: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-white">{rev.author}</span>
                      <span className="text-zinc-500">{rev.date}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Recommendations lookup lists */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Nearby Recommendations</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400">
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg">
                  <span className="text-primary">🍽</span>
                  <span className="truncate">Restaurants: 0.2 km</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg">
                  <span className="text-indigo-400">🚇</span>
                  <span className="truncate">Metro Station: 0.4 km</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg">
                  <span className="text-amber-400">🅿</span>
                  <span className="truncate">Parking: 0.1 km</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg">
                  <span className="text-emerald-400">🏧</span>
                  <span className="truncate">ATM Cash: 0.3 km</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-zinc-500">
            Select any activity on the timeline to explore details.
          </div>
        )}
      </div>

      {/* Route Statistics (Bottom of Right Sidebar) */}
      <div className="p-4 border-t border-white/10 bg-white/5 space-y-2 shrink-0">
        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Route Statistics ({activeDayFilter === "all" ? "Entire Trip" : `Day ${activeDayFilter}`})</span>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-white/5 p-1.5 rounded-lg">
            <span className="text-zinc-500 block">Walking</span>
            <span className="font-bold text-white">{walkingDist} km</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-lg">
            <span className="text-zinc-500 block">Transit</span>
            <span className="font-bold text-white">{metroRides} metro</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-lg">
            <span className="text-zinc-500 block">CO₂ Saved</span>
            <span className="font-bold text-emerald-400">-{co2Saved} kg</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
          <span>Total Travel Time: <span className="font-bold text-white">{totalTravelTime}</span></span>
          <span>Est. Cost: <span className="font-bold text-emerald-400">${estCost}</span></span>
        </div>
      </div>
    </GlassCard>
  );
}
