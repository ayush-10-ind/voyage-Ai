import React, { useState } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { useCopilotStore } from "@/features/copilot/store/use-copilot-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Divider } from "@/components/ui/misc-primitives";
import { BudgetDashboard } from "@/features/finance/components/budget-dashboard";
import { FinanceAnalytics } from "@/features/finance/components/finance-analytics";
import { ExpenseTracker } from "@/features/finance/components/expense-tracker";
import { FinanceCopilot } from "@/features/finance/components/finance-copilot";
import { RouteEngine } from "@/features/map/domain/route-engine";

export function LeftSidebar() {
  const { trip } = useTimelineStore();
  const { itinerary } = useCopilotStore();
  const [activeTab, setActiveTab] = useState<"overview" | "finance">("overview");

  if (!trip) return null;

  // Derive some basic info
  const totalDays = trip.days.length;
  const destinationName = trip.destination;
  const hotelSelected = itinerary?.hotels?.[0]?.name || "None selected";
  const budgetTotal = trip.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : (itinerary?.budget?.total || "$1,500");

  const getFlightStatus = (dest: string) => {
    const code = 
      dest.toLowerCase().includes("tokyo") ? "HND" :
      dest.toLowerCase().includes("zermatt") ? "ZRH" :
      dest.toLowerCase().includes("reykjavik") ? "KEF" :
      dest.toLowerCase().includes("ubud") ? "DPS" :
      dest.toLowerCase().includes("tromso") ? "TOS" :
      dest.toLowerCase().includes("paris") ? "CDG" :
      dest.toLowerCase().includes("bali") ? "DPS" :
      dest.substring(0, 3).toUpperCase();
    return `${code} ➔ JFK • On Time`;
  };

  // Calculate route travel intelligence stats
  const activities = trip.days.flatMap((d) => d.activities);
  const routeSummary = RouteEngine.calculateRouteSummary(activities);

  return (
    <GlassCard padding="none" className="w-full h-full flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left min-h-[600px] overflow-hidden">
      {/* Tabbed Header */}
      <div className="p-1 border-b border-white/5 bg-white/5 flex gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
            activeTab === "overview"
              ? "bg-white/10 text-white shadow-sm"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("finance")}
          className={`flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
            activeTab === "finance"
              ? "bg-white/10 text-white shadow-sm"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          Finance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Header */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Destination</p>
            <Typography variant="title" className="text-xl font-black font-heading text-white tracking-tight">
              {destinationName}
            </Typography>
          </div>

          <Divider text="Trip Statistics" />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-2">
            {/* Total Days */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Icons.calendar className="h-4 w-4 text-primary/80" />
                Total Days
              </span>
              <span className="font-bold text-white">{totalDays} Days</span>
            </div>

            {/* Estimated Budget */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Icons.budget className="h-4 w-4 text-emerald-400" />
                Est. Budget
              </span>
              <span className="font-bold text-emerald-400">{budgetTotal}</span>
            </div>

            {/* Scenic Rating */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Icons.explore className="h-4 w-4 text-amber-400" />
                Scenic Score
              </span>
              <span className="font-bold text-amber-400">{routeSummary.scenicScore} / 10</span>
            </div>

            {/* Carbon Footprint */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Icons.filter className="h-4 w-4 text-cyan-400 animate-pulse-slow" />
                Carbon Footprint
              </span>
              <span className="font-bold text-cyan-400">{routeSummary.carbonScoreKg} kg CO2</span>
            </div>
          </div>

          <Divider text="Accommodations" />

          {/* Selected Hotel Card */}
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 flex gap-3 items-center">
            <Icons.hotel className="h-5 w-5 text-secondary shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Hotel Selected</p>
              <p className="text-xs font-bold text-white truncate">{hotelSelected}</p>
            </div>
          </div>

          <Divider text="Transportation" />

          {/* Flight Status */}
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 flex gap-3 items-center">
            <Icons.flight className="h-5 w-5 text-primary shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Flight Status</p>
              <p className="text-xs font-bold text-white truncate">{getFlightStatus(destinationName)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <BudgetDashboard />
          <Divider text="Financial Analytics" />
          <FinanceAnalytics />
          <Divider text="Ledger & Actions" />
          <ExpenseTracker />
          <Divider text="AI Recommendation" />
          <FinanceCopilot />
        </div>
      )}
    </GlassCard>
  );
}
