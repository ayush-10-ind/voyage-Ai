"use client";

import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Divider } from "@/components/ui/misc-primitives";
import { ActivityCategory } from "../types";

interface AICopilotInsight {
  recommendation: string;
  optimization: string;
  warning: string;
  attractions: string[];
  weather: string;
  travelTime: string;
}

function getInsightsForActivity(title: string, category: ActivityCategory, time: string): AICopilotInsight {
  switch (category) {
    case "dining":
      return {
        recommendation: "This restaurant is highly rated. We recommend making a reservation at least 3 days in advance.",
        optimization: "Budget Tip: Lunch sets here are typically 40% cheaper than the dinner menus.",
        warning: "Reservation Required: Walk-ins are rarely accepted during peak dinner hours.",
        attractions: ["Golden Gai Bars (12m walk)", "Omoide Yokocho (15m walk)", "Local Saké Cellar (5m walk)"],
        weather: "Indoors • N/A",
        travelTime: "10m transit from previous stop",
      };
    case "transit":
      return {
        recommendation: "Be sure to purchase a regional travel pass (like JR Pass or Suica) to save on individual fares.",
        optimization: "Alternative: Taking the local express instead of the rapid train saves $15 with only a 10-minute difference.",
        warning: "Peak Hours: Expect heavy congestion during commute times (8:00 AM - 9:30 AM).",
        attractions: ["Station Mall (2m walk)", "Tourist Info Center (3m walk)", "Sky Deck Observatory (8m walk)"],
        weather: "Indoors • N/A",
        travelTime: "N/A",
      };
    case "accommodation":
      return {
        recommendation: "Double-check the check-in policy. Some boutique hotels require check-in before 8:00 PM.",
        optimization: "Loyalty Perk: Enquire about complimentary breakfast or room upgrades upon check-in.",
        warning: "Late Check-in: If arriving after 6 PM, notify the host to ensure key-box access.",
        attractions: ["24/7 Convenience Store (1m walk)", "Currency Exchange (3m walk)", "Local Café (2m walk)"],
        weather: "Indoors • N/A",
        travelTime: "25m taxi from station",
      };
    case "other":
      return {
        recommendation: "Keep local currency on hand as smaller shops in this area may not accept credit cards.",
        optimization: "Language Tip: Downloading the offline translation pack will be very helpful here.",
        warning: "Check Weather: This is an outdoor activity. Have an umbrella ready in case of light showers.",
        attractions: ["Local Café (3m walk)", "Information Kiosk (5m walk)", "Boutique Craft Shop (6m walk)"],
        weather: "20°C Light Rain expected",
        travelTime: "15m walk",
      };
    case "sightseeing":
    default:
      return {
        recommendation: `Since you are visiting "${title}" at ${time || "09:00 AM"}, we suggest booking tickets 2 weeks in advance to avoid long queues.`,
        optimization: `Route Optimization: Visit "${title}" early in the morning to capture the best lighting and avoid crowds.`,
        warning: "Crowd Warning: High traffic expected between 10:00 AM and 2:00 PM.",
        attractions: ["Historical Garden (5m walk)", "Art Gallery (8m walk)", "Traditional Tea House (10m walk)"],
        weather: "22°C Sunny",
        travelTime: "15m walking",
      };
  }
}

export function RightSidebar() {
  const { trip, selectedActivityId, updateActivity, selectActivity, deleteActivity, duplicateActivity } = useTimelineStore();
  const [notes, setNotes] = useState("");

  // Find the selected activity and its day
  let selectedActivity: any = null;
  let selectedDayNumber = 1;

  if (trip && selectedActivityId) {
    for (const day of trip.days) {
      const act = day.activities.find((a) => a.id === selectedActivityId);
      if (act) {
        selectedActivity = act;
        selectedDayNumber = day.dayNumber;
        break;
      }
    }
  }

  // Update local notes state when selection changes
  useEffect(() => {
    if (selectedActivity) {
      setNotes(selectedActivity.notes || "");
    }
  }, [selectedActivityId, selectedActivity]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (selectedActivityId) {
      updateActivity(selectedDayNumber, selectedActivityId, { notes: val });
    }
  };

  const handleFieldChange = (field: string, val: any) => {
    if (selectedActivityId) {
      updateActivity(selectedDayNumber, selectedActivityId, { [field]: val });
    }
  };

  if (!selectedActivity) {
    return (
      <GlassCard padding="md" className="w-full h-full flex flex-col justify-center items-center text-center gap-3 border-glow shadow-glass pointer-events-auto min-h-[600px]">
        <Icons.info className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
        <div className="space-y-1">
          <Typography variant="body" className="font-semibold text-white text-sm">
            No Event Selected
          </Typography>
          <p className="text-xs text-muted-foreground max-w-[180px] mx-auto leading-relaxed">
            Select any card on the timeline to view details, add notes, and see recommendations.
          </p>
        </div>
      </GlassCard>
    );
  }

  const categories: { label: string; value: ActivityCategory }[] = [
    { label: "Sightseeing", value: "sightseeing" },
    { label: "Dining", value: "dining" },
    { label: "Transit", value: "transit" },
    { label: "Accommodation", value: "accommodation" },
    { label: "Other", value: "other" },
  ];

  return (
    <GlassCard padding="none" className="w-full h-full flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left min-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <Typography variant="body" className="font-bold text-white text-sm flex items-center gap-1.5">
          <Icons.explore className="h-4 w-4 text-primary" />
          Context Panel
        </Typography>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectActivity(null)}
          className="h-6 w-6 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
        >
          <Icons.close className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scrollable Details */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Editable Title */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-semibold text-muted-foreground">Title</label>
          <Input
            type="text"
            value={selectedActivity.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="bg-white/5 border-white/10 focus:border-primary/50 text-xs font-bold text-white py-1 h-8"
          />
        </div>

        {/* Category Dropdown/Select */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-semibold text-muted-foreground">Category</label>
          <select
            value={selectedActivity.category}
            onChange={(e) => handleFieldChange("category", e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-primary/50"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-background text-foreground">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time, Duration, Cost Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-semibold text-muted-foreground">Time</label>
            <Input
              type="text"
              value={selectedActivity.time}
              onChange={(e) => handleFieldChange("time", e.target.value)}
              className="bg-white/5 border-white/10 text-[10px] py-1 h-8 px-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-semibold text-muted-foreground">Duration</label>
            <Input
              type="text"
              value={selectedActivity.duration || "1h"}
              onChange={(e) => handleFieldChange("duration", e.target.value)}
              className="bg-white/5 border-white/10 text-[10px] py-1 h-8 px-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-semibold text-muted-foreground">Cost</label>
            <Input
              type="text"
              value={selectedActivity.cost}
              onChange={(e) => handleFieldChange("cost", e.target.value)}
              className="bg-white/5 border-white/10 text-[10px] py-1 h-8 px-2"
            />
          </div>
        </div>

        {/* Interactive Notes Section */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-semibold text-muted-foreground">Personal Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add restaurant recommendations, directions, or booking numbers..."
            className="bg-white/5 border-white/10 focus:border-primary/50 text-xs min-h-[80px]"
          />
        </div>

        {/* Financial Management Section */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <Typography variant="caption" className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1.5">
            <Icons.budget className="h-3.5 w-3.5 text-primary" />
            Financial Management
          </Typography>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Planned ($)</label>
              <Input
                type="number"
                value={selectedActivity.plannedCost !== undefined ? selectedActivity.plannedCost : ""}
                onChange={(e) => handleFieldChange("plannedCost", parseFloat(e.target.value) || 0)}
                className="bg-white/5 border-white/10 text-xs py-1 h-8 px-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Actual ($)</label>
              <Input
                type="number"
                value={selectedActivity.actualCost !== undefined ? selectedActivity.actualCost : ""}
                onChange={(e) => handleFieldChange("actualCost", parseFloat(e.target.value) || 0)}
                className="bg-white/5 border-white/10 text-xs py-1 h-8 px-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Status</label>
              <select
                value={selectedActivity.paymentStatus || "unpaid"}
                onChange={(e) => handleFieldChange("paymentStatus", e.target.value)}
                className="w-full h-8 bg-white/5 border border-white/10 text-xs rounded-xl p-1.5 text-white focus:outline-none"
              >
                <option value="unpaid" className="bg-background text-foreground">Unpaid</option>
                <option value="paid" className="bg-background text-foreground">Paid</option>
                <option value="partially_paid" className="bg-background text-foreground">Partially Paid</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Method</label>
              <select
                value={selectedActivity.paymentMethod || "credit_card"}
                onChange={(e) => handleFieldChange("paymentMethod", e.target.value)}
                className="w-full h-8 bg-white/5 border border-white/10 text-xs rounded-xl p-1.5 text-white focus:outline-none"
              >
                <option value="credit_card" className="bg-background text-foreground">Credit Card</option>
                <option value="cash" className="bg-background text-foreground">Cash</option>
                <option value="digital_wallet" className="bg-background text-foreground">Digital Wallet</option>
                <option value="other" className="bg-background text-foreground">Other</option>
              </select>
            </div>
          </div>
        </div>

        <Divider text="Context Insights" />

        {/* Dynamic Context Insights */}
        {(() => {
          const insights = getInsightsForActivity(selectedActivity.title, selectedActivity.category, selectedActivity.time);
          return (
            <div className="space-y-4">
              {/* Travel Time & Weather Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Icons.time className="h-3.5 w-3.5 text-primary" />
                    Travel Est.
                  </span>
                  <span className="font-bold text-white">{insights.travelTime}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-2 border border-white/5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Icons.weatherSun className="h-3.5 w-3.5 text-amber-400" />
                    Weather
                  </span>
                  <span className="font-bold text-white">{insights.weather}</span>
                </div>
              </div>

              {/* AI Recommendation Card */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs space-y-1.5 leading-relaxed">
                <p className="font-semibold text-primary flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Icons.sparkles className="h-3.5 w-3.5" />
                  AI Recommendation
                </p>
                <p className="text-[11px] text-muted-foreground/90">
                  {insights.recommendation}
                </p>
              </div>

              {/* Route Optimization Card */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-xs space-y-1.5 leading-relaxed">
                <p className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Icons.explore className="h-3.5 w-3.5" />
                  Optimization Opportunity
                </p>
                <p className="text-[11px] text-muted-foreground/90">
                  {insights.optimization}
                </p>
              </div>

              {/* Warning Card */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-xs space-y-1.5 leading-relaxed">
                <p className="font-semibold text-amber-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Icons.warning className="h-3.5 w-3.5" />
                  Smart Warning
                </p>
                <p className="text-[11px] text-muted-foreground/90">
                  {insights.warning}
                </p>
              </div>

              {/* Nearby Attractions */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Nearby Attractions</p>
                <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 space-y-1">
                  {insights.attractions.map((attraction, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <span>{attraction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer Quick Actions */}
      <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
        <Button
          variant="outline"
          onClick={() => duplicateActivity(selectedDayNumber, selectedActivity.id)}
          className="flex-1 rounded-xl text-xs py-5 glass hover:bg-white/10"
        >
          <Icons.share className="h-4 w-4 mr-1.5" />
          Duplicate
        </Button>
        <Button
          onClick={() => {
            deleteActivity(selectedDayNumber, selectedActivity.id);
            selectActivity(null);
          }}
          className="flex-1 rounded-xl text-xs py-5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
        >
          <Icons.trash className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
      </div>
    </GlassCard>
  );
}
