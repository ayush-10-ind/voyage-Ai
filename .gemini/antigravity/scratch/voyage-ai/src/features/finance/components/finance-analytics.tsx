import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../../timeline/store/use-timeline-store";
import { AnalyticsEngine } from "../domain/analytics-engine";
import { Typography } from "@/components/ui/typography";
import { Divider } from "@/components/ui/misc-primitives";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export function FinanceAnalytics() {
  const { trip } = useTimelineStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"category" | "trend" | "pacing">("category");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!trip) return null;

  const activities = trip.days.flatMap((d) => d.activities);
  const manualExpenses = trip.manualExpenses || [];

  // 1. Get Analytics Data
  const categoryData = AnalyticsEngine.getCategoryBreakdown(activities, manualExpenses);
  const dailyData = AnalyticsEngine.getDailySpendingTrend(trip.days, manualExpenses);

  if (!mounted) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground bg-white/5 border border-white/5 rounded-2xl">
        Loading interactive charts...
      </div>
    );
  }

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border border-white/10 p-2.5 rounded-xl text-[10px] text-left space-y-1 shadow-glass">
          {label && <p className="font-bold text-white uppercase tracking-wider">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="font-semibold">
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 text-left">
      {/* Tab Selectors */}
      <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
        {(["category", "trend", "pacing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="h-[200px] w-full bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-center">
        {activeTab === "category" && (
          categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-muted-foreground">No expenses logged yet.</span>
          )
        )}

        {activeTab === "trend" && (
          dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="dayName" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeActual"
                  name="Cumulative Actual"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-muted-foreground">No daily data available.</span>
          )
        )}

        {activeTab === "pacing" && (
          dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="dayName" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="planned" name="Planned" fill="#5B8CFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-muted-foreground">No pacing data available.</span>
          )
        )}
      </div>

      {/* Legend / Info Footer */}
      {activeTab === "category" && categoryData.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-h-[70px] overflow-y-auto pr-1 custom-scrollbar">
          {categoryData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
              <span className="font-bold text-white ml-auto">${item.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
