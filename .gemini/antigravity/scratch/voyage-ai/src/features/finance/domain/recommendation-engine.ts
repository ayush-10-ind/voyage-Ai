import { Activity, ExpenseItem } from "../../timeline/types";

export interface DomainRecommendationRuleResult {
  code: "OVER_BUDGET" | "NEAR_LIMIT" | "HIGH_ACCOMMODATION" | "HIGH_TRANSIT" | "UNPAID_ACTIVITIES" | "SAVINGS_FOUND";
  severity: "critical" | "warning" | "opportunity" | "info";
  meta?: Record<string, any>;
}

export class RecommendationEngine {
  /**
   * Analyzes trip financial data and returns a list of triggered recommendation rule codes.
   */
  static analyze(
    totalBudget: number,
    activities: Activity[],
    manualExpenses: ExpenseItem[]
  ): DomainRecommendationRuleResult[] {
    const results: DomainRecommendationRuleResult[] = [];

    // 1. Calculate Totals
    const activityPlanned = activities.reduce((sum, act) => sum + (act.plannedCost || 0), 0);
    const manualPlanned = manualExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPlannedSpend = activityPlanned + manualPlanned;

    const activityActual = activities.reduce((sum, act) => {
      if (act.paymentStatus === "paid") return sum + (act.actualCost ?? act.plannedCost ?? 0);
      if (act.paymentStatus === "partially_paid") return sum + (act.actualCost ?? 0);
      return sum;
    }, 0);
    const totalActualSpend = activityActual + manualPlanned;

    // 2. Budget Overrun Rules
    if (totalActualSpend > totalBudget) {
      results.push({
        code: "OVER_BUDGET",
        severity: "critical",
        meta: { overspent: totalActualSpend - totalBudget },
      });
    } else if (totalPlannedSpend > totalBudget) {
      results.push({
        code: "NEAR_LIMIT",
        severity: "warning",
        meta: { overplanned: totalPlannedSpend - totalBudget },
      });
    }

    // 3. Category Breakdown Rules
    let lodgingSpend = 0;
    let transitSpend = 0;
    activities.forEach((act) => {
      const cost = act.actualCost ?? act.plannedCost ?? 0;
      if (act.category === "accommodation") lodgingSpend += cost;
      else if (act.category === "transit") transitSpend += cost;
    });

    if (totalPlannedSpend > 0) {
      if (lodgingSpend / totalPlannedSpend > 0.5) {
        results.push({
          code: "HIGH_ACCOMMODATION",
          severity: "info",
          meta: { percentage: Math.round((lodgingSpend / totalPlannedSpend) * 100) },
        });
      }
      if (transitSpend / totalPlannedSpend > 0.25) {
        results.push({
          code: "HIGH_TRANSIT",
          severity: "opportunity",
          meta: { percentage: Math.round((transitSpend / totalPlannedSpend) * 100) },
        });
      }
    }

    // 4. Unpaid Activities Rules
    const unpaidCount = activities.filter((act) => act.paymentStatus === "unpaid" && (act.plannedCost || 0) > 0).length;
    if (unpaidCount > 3) {
      results.push({
        code: "UNPAID_ACTIVITIES",
        severity: "warning",
        meta: { count: unpaidCount },
      });
    }

    // 5. Basic Savings Opportunity Rule
    const highCostSightseeing = activities.filter(
      (act) => act.category === "sightseeing" && (act.plannedCost || 0) > 100
    );
    if (highCostSightseeing.length > 0) {
      results.push({
        code: "SAVINGS_FOUND",
        severity: "opportunity",
        meta: { count: highCostSightseeing.length, sample: highCostSightseeing[0].title },
      });
    }

    return results;
  }
}
