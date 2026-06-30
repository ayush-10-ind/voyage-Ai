import React, { useState, useEffect } from "react";
import { useTimelineStore } from "../../timeline/store/use-timeline-store";
import { MockRecommendationProvider } from "../providers/mock-recommendation-provider";
import { FinanceRecommendation } from "../providers/recommendation-provider";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

// We instantiate the provider. In a real application, this could be injected via context or props.
const recommendationProvider = new MockRecommendationProvider();

export function FinanceCopilot() {
  const { trip } = useTimelineStore();
  const [recommendations, setRecommendations] = useState<FinanceRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trip) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const activities = trip.days.flatMap((d) => d.activities);
        const manualExpenses = trip.manualExpenses || [];
        
        // Call the decoupled provider interface
        const recs = await recommendationProvider.getRecommendations({
          totalBudget: trip.totalBudget || 1500,
          plannedSpend: activities.reduce((sum, act) => sum + (act.plannedCost || 0), 0) + manualExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          actualSpend: activities.reduce((sum, act) => {
            if (act.paymentStatus === "paid") return sum + (act.actualCost ?? act.plannedCost ?? 0);
            if (act.paymentStatus === "partially_paid") return sum + (act.actualCost ?? 0);
            return sum;
          }, 0) + manualExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          daysCount: trip.days.length,
          activities,
          manualExpenses,
        });

        // Simulate a slight network delay for premium skeleton feel
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to fetch finance recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [trip]);

  if (!trip) return null;

  const getSeverityStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-rose-500/5 border-rose-500/10 text-rose-400";
      case "alert":
        return "bg-amber-500/5 border-amber-500/10 text-amber-400";
      case "opportunity":
        return "bg-emerald-500/5 border-emerald-500/10 text-emerald-400";
      case "info":
      default:
        return "bg-blue-500/5 border-blue-500/10 text-blue-400";
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Icons.error className="h-4 w-4 shrink-0 text-rose-400" />;
      case "alert":
        return <Icons.warning className="h-4 w-4 shrink-0 text-amber-400" />;
      case "opportunity":
        return <Icons.explore className="h-4 w-4 shrink-0 text-emerald-400" />;
      case "info":
      default:
        return <Icons.info className="h-4 w-4 shrink-0 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-3.5 text-left">
      <Typography variant="caption" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icons.sparkles className="h-3.5 w-3.5 text-primary" />
        AI Finance Insights
      </Typography>

      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-[68px] w-full" />
          <Skeleton className="h-[68px] w-full" />
          <Skeleton className="h-[68px] w-full" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-3.5 rounded-xl border flex gap-3 items-start transition-all duration-300 leading-relaxed ${getSeverityStyles(
                rec.type
              )}`}
            >
              {getSeverityIcon(rec.type)}
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-white leading-snug">{rec.title}</p>
                <p className="text-[11px] text-muted-foreground/90">{rec.message}</p>
                {rec.savingsAmount && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-wider">
                    Est. Savings: +${rec.savingsAmount}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
