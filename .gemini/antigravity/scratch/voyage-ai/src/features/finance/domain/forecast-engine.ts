import { Activity, ExpenseItem } from "../../timeline/types";

export interface ForecastMetrics {
  projectedTotalSpend: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  confidenceLevel: "low" | "medium" | "high";
  message: string;
}

export class ForecastEngine {
  /**
   * Generates a spending forecast based on actual spending and planned future spending.
   */
  static generateForecast(
    totalBudget: number,
    daysCount: number,
    currentDayIndex: number, // 1-based index of the current day of the trip
    activities: Activity[],
    manualExpenses: ExpenseItem[]
  ): ForecastMetrics {
    // 1. Calculate actual spend so far
    const activityActual = activities.reduce((sum, act) => {
      if (act.paymentStatus === "paid") return sum + (act.actualCost ?? act.plannedCost ?? 0);
      if (act.paymentStatus === "partially_paid") return sum + (act.actualCost ?? 0);
      return sum;
    }, 0);
    const manualActual = manualExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalActualSpend = activityActual + manualActual;

    // 2. Calculate average spend per day so far
    const daysElapsed = Math.max(1, currentDayIndex);
    const averageDailySpend = totalActualSpend / daysElapsed;

    // 3. Project total spend using a hybrid model:
    // Actual spend so far + (Planned spend for remaining days)
    // We can approximate planned spend for remaining days by looking at the remaining days' activities.
    const plannedRemaining = activities.reduce((sum, act) => {
      // If the activity is in a future day (we don't have day number in activity directly,
      // but we can assume unpaid activities or estimate based on day mapping)
      if (act.paymentStatus === "unpaid") {
        return sum + (act.plannedCost || 0);
      }
      return sum;
    }, 0);

    const projectedTotalSpend = totalActualSpend + plannedRemaining;
    const isOverBudget = projectedTotalSpend > totalBudget;
    const overBudgetAmount = isOverBudget ? projectedTotalSpend - totalBudget : 0;

    // 4. Determine confidence level
    // More days elapsed = higher confidence in the average daily spend trend
    let confidenceLevel: "low" | "medium" | "high" = "low";
    if (daysCount > 0) {
      const ratio = daysElapsed / daysCount;
      if (ratio > 0.6) confidenceLevel = "high";
      else if (ratio > 0.3) confidenceLevel = "medium";
    }

    // 5. Generate contextual message
    let message = "Spending is on track to remain within budget.";
    if (isOverBudget) {
      message = `Projected total spend is $${projectedTotalSpend.toFixed(2)}, which exceeds your budget by $${overBudgetAmount.toFixed(2)}.`;
    } else if (projectedTotalSpend > totalBudget * 0.9) {
      message = "Warning: Spending is projected to come very close to your budget limit.";
    }

    return {
      projectedTotalSpend,
      isOverBudget,
      overBudgetAmount,
      confidenceLevel,
      message,
    };
  }
}
