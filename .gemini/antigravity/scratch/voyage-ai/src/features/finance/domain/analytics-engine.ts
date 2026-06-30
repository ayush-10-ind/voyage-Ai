import { Activity, ExpenseItem, Day } from "../../timeline/types";

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}

export interface DailyChartData {
  dayName: string;
  dayNumber: number;
  planned: number;
  actual: number;
  cumulativeActual: number;
  cumulativePlanned: number;
}

export class AnalyticsEngine {
  // Color palette matching Voyage AI aesthetics
  private static categoryColors: Record<string, string> = {
    sightseeing: "#5B8CFF",    // Primary Accent Blue
    dining: "#8B5CF6",         // Secondary Accent Violet
    transit: "#10B981",        // Emerald Green
    accommodation: "#F59E0B",  // Amber Yellow
    other: "#6B7280",          // Gray
    shopping: "#EC4899",       // Pink
  };

  /**
   * Generates category breakdown chart data.
   */
  static getCategoryBreakdown(
    activities: Activity[],
    manualExpenses: ExpenseItem[]
  ): CategoryChartData[] {
    const totals: Record<string, number> = {
      sightseeing: 0,
      dining: 0,
      transit: 0,
      accommodation: 0,
      other: 0,
    };

    // Sum activity costs
    activities.forEach((act) => {
      const cost = act.actualCost ?? act.plannedCost ?? 0;
      const cat = act.category || "other";
      totals[cat] = (totals[cat] || 0) + cost;
    });

    // Sum manual expenses
    manualExpenses.forEach((exp) => {
      const cat = exp.category || "other";
      totals[cat] = (totals[cat] || 0) + exp.amount;
    });

    // Format for Recharts
    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        color: this.categoryColors[name] || this.categoryColors.other,
      }));
  }

  /**
   * Generates day-by-day spending trend data.
   */
  static getDailySpendingTrend(
    days: Day[],
    manualExpenses: ExpenseItem[]
  ): DailyChartData[] {
    let cumulativeActual = 0;
    let cumulativePlanned = 0;

    // Convert manual expenses to a map by date or distribute them across days
    // For simplicity, we can map manual expenses to specific days or distribute them.
    // Let's assume manual expenses have a 'date' or we can associate them with Day index.
    
    return days.map((day, idx) => {
      // Calculate planned and actual for this day's activities
      const dayPlanned = day.activities.reduce((sum, act) => sum + (act.plannedCost || 0), 0);
      const dayActual = day.activities.reduce((sum, act) => {
        if (act.paymentStatus === "paid") return sum + (act.actualCost ?? act.plannedCost ?? 0);
        if (act.paymentStatus === "partially_paid") return sum + (act.actualCost ?? 0);
        return sum;
      }, 0);

      // Add manual expenses that match this day's index (mock matching for manual expenses)
      const dayManual = manualExpenses
        .filter((_, expIdx) => expIdx % days.length === idx)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const totalPlanned = dayPlanned + dayManual;
      const totalActual = dayActual + dayManual;

      cumulativePlanned += totalPlanned;
      cumulativeActual += totalActual;

      return {
        dayName: `Day ${day.dayNumber}`,
        dayNumber: day.dayNumber,
        planned: Math.round(totalPlanned * 100) / 100,
        actual: Math.round(totalActual * 100) / 100,
        cumulativePlanned: Math.round(cumulativePlanned * 100) / 100,
        cumulativeActual: Math.round(cumulativeActual * 100) / 100,
      };
    });
  }
}
