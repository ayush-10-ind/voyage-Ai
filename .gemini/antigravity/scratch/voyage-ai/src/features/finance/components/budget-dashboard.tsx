import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../../timeline/store/use-timeline-store";
import { BudgetEngine } from "../domain/budget-engine";
import { CurrencyEngine } from "../domain/currency-engine";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoyageLogger } from "@/lib/logger";

export function BudgetDashboard() {
  const { trip, setTotalBudget } = useTimelineStore();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    if (trip) {
      VoyageLogger.info("Navigation", "Transition: Timeline → Finance (Initializing Budget Dashboard)");
    }
  }, [trip]);

  if (!trip) return null;

  const totalBudget = trip.totalBudget || 1500;
  const currency = trip.currency || "USD";
  const daysCount = trip.days.length || 1;
  const activities = trip.days.flatMap((d) => d.activities);
  const manualExpenses = trip.manualExpenses || [];

  // Calculate metrics using pure domain engine
  const metrics = BudgetEngine.calculateMetrics(
    totalBudget,
    daysCount,
    activities,
    manualExpenses
  );

  const handleEditBudget = () => {
    setTempBudget(totalBudget.toString());
    setIsEditingBudget(true);
  };

  const handleSaveBudget = () => {
    const parsed = parseFloat(tempBudget);
    if (!isNaN(parsed) && parsed >= 0) {
      setTotalBudget(parsed);
    }
    setIsEditingBudget(false);
  };

  // Determine health color classes
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/30 bg-amber-500/5";
    return "text-rose-400 border-rose-500/30 bg-rose-500/5";
  };

  return (
    <div className="space-y-4 text-left">
      {/* Budget Health Score */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${getHealthColor(metrics.healthScore)}`}>
        <div className="space-y-0.5">
          <Typography variant="caption" className="text-[10px] uppercase font-bold tracking-wider opacity-75">
            Budget Health Score
          </Typography>
          <Typography variant="title" className="text-2xl font-black font-heading leading-none">
            {metrics.healthScore}%
          </Typography>
        </div>
        <div className="h-10 w-10 rounded-full border-2 border-current flex items-center justify-center font-bold text-xs shadow-glow">
          {metrics.healthScore >= 80 ? "Good" : metrics.healthScore >= 50 ? "Warn" : "Risk"}
        </div>
      </div>

      {/* Main Budget Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Budget Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between min-h-[85px]">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
            <Icons.budget className="h-3.5 w-3.5 text-primary" />
            Total Budget
          </span>
          {isEditingBudget ? (
            <div className="flex items-center gap-1.5 mt-2">
              <Input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="h-7 py-1 px-2 text-xs bg-white/5 border-white/10 text-white focus:border-primary/50 rounded-lg w-20"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveBudget}
                className="h-7 px-2 bg-primary hover:bg-primary/90 text-[10px]"
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-black text-white">
                {CurrencyEngine.format(totalBudget, currency)}
              </span>
              <button
                onClick={handleEditBudget}
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label="Edit budget"
              >
                <Icons.edit className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Remaining Budget Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between min-h-[85px]">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
            <Icons.explore className="h-3.5 w-3.5 text-emerald-400" />
            Remaining
          </span>
          <span className={`text-base font-black mt-2 ${metrics.remainingBudget <= metrics.emergencyBuffer ? "text-amber-400" : "text-emerald-400"}`}>
            {CurrencyEngine.format(metrics.remainingBudget, currency)}
          </span>
        </div>

        {/* Planned Spend Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between min-h-[85px]">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            Planned Spend
          </span>
          <span className="text-base font-black text-white mt-2">
            {CurrencyEngine.format(metrics.totalPlannedSpend, currency)}
          </span>
        </div>

        {/* Actual Spend Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between min-h-[85px]">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            Actual Spend
          </span>
          <span className="text-base font-black text-white mt-2">
            {CurrencyEngine.format(metrics.totalActualSpend, currency)}
          </span>
        </div>
      </div>

      {/* Sub-Metrics Row */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Icons.time className="h-3.5 w-3.5" />
            Daily Allowance
          </span>
          <span className="font-bold text-white">
            {CurrencyEngine.format(metrics.dailyBudget, currency)} / day
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Icons.settings className="h-3.5 w-3.5" />
            Emergency Buffer (10%)
          </span>
          <span className="font-bold text-amber-500/80">
            {CurrencyEngine.format(metrics.emergencyBuffer, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
