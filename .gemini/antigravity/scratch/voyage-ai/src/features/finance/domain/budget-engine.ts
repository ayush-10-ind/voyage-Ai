import { Activity, ExpenseItem } from "../../timeline/types";

export interface BudgetMetrics {
  totalBudget: number;
  totalPlannedSpend: number;
  totalActualSpend: number;
  remainingBudget: number;
  dailyBudget: number;
  emergencyBuffer: number;
  healthScore: number;
}

export class BudgetEngine {
  /**
   * Calculates all budget metrics from the trip state.
   */
  static calculateMetrics(
    totalBudget: number,
    daysCount: number,
    activities: Activity[],
    manualExpenses: ExpenseItem[]
  ): BudgetMetrics {
    // 1. Calculate Planned Spend
    const activityPlanned = activities.reduce((sum, act) => sum + (act.plannedCost || 0), 0);
    const manualPlanned = manualExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPlannedSpend = activityPlanned + manualPlanned;

    // 2. Calculate Actual Spend (only paid or partially paid)
    const activityActual = activities.reduce((sum, act) => {
      if (act.paymentStatus === "paid") {
        return sum + (act.actualCost ?? act.plannedCost ?? 0);
      }
      if (act.paymentStatus === "partially_paid") {
        return sum + (act.actualCost ?? 0);
      }
      return sum;
    }, 0);
    const totalActualSpend = activityActual + manualPlanned; // Assume manual expenses are actual spend

    // 3. Calculate Remaining Budget
    const remainingBudget = Math.max(0, totalBudget - totalActualSpend);

    // 4. Calculate Daily Budget
    const dailyBudget = daysCount > 0 ? remainingBudget / daysCount : 0;

    // 5. Emergency Buffer (10% of total budget)
    const emergencyBuffer = totalBudget * 0.1;

    // 6. Calculate Budget Health Score (0 - 100)
    const healthScore = this.calculateHealthScore(totalBudget, totalPlannedSpend, totalActualSpend);

    return {
      totalBudget,
      totalPlannedSpend,
      totalActualSpend,
      remainingBudget,
      dailyBudget,
      emergencyBuffer,
      healthScore,
    };
  }

  /**
   * Computes a health score out of 100 based on spending indicators.
   */
  private static calculateHealthScore(
    totalBudget: number,
    plannedSpend: number,
    actualSpend: number
  ): number {
    if (totalBudget <= 0) return 0;

    let score = 100;

    // Penalty for planning more than the total budget
    if (plannedSpend > totalBudget) {
      const overplannedRatio = (plannedSpend - totalBudget) / totalBudget;
      score -= Math.min(40, overplannedRatio * 100); // Max 40% penalty for overplanning
    }

    // Penalty for actual spend exceeding total budget
    if (actualSpend > totalBudget) {
      const overspentRatio = (actualSpend - totalBudget) / totalBudget;
      score -= Math.min(60, overspentRatio * 150); // Max 60% penalty for overspending
    }

    // Penalty for actual spend exceeding planned spend (unplanned expenses)
    if (actualSpend > plannedSpend && plannedSpend > 0) {
      const unplannedRatio = (actualSpend - plannedSpend) / plannedSpend;
      score -= Math.min(20, unplannedRatio * 50); // Max 20% penalty
    }

    return Math.max(0, Math.round(score));
  }
}
