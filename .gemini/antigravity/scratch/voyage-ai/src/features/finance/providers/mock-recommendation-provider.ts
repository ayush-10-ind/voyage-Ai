import { FinanceRecommendationProvider, FinanceRecommendation, RecommendationContext } from "./recommendation-provider";
import { RecommendationEngine } from "../domain/recommendation-engine";

export class MockRecommendationProvider implements FinanceRecommendationProvider {
  /**
   * Generates travel finance recommendations based on pure domain rules.
   */
  async getRecommendations(context: RecommendationContext): Promise<FinanceRecommendation[]> {
    const rules = RecommendationEngine.analyze(
      context.totalBudget,
      context.activities,
      context.manualExpenses
    );

    const recommendations: FinanceRecommendation[] = [];

    rules.forEach((rule) => {
      switch (rule.code) {
        case "OVER_BUDGET":
          recommendations.push({
            id: "rec-over-budget",
            type: "warning",
            title: "Budget Overrun Warning",
            message: `Your actual spend has exceeded the total budget by $${rule.meta?.overspent.toFixed(2)}. We recommend reviewing unpaid events to cut costs.`,
          });
          break;
        case "NEAR_LIMIT":
          recommendations.push({
            id: "rec-near-limit",
            type: "alert",
            title: "Approaching Budget Limit",
            message: `Your total planned spend exceeds the budget by $${rule.meta?.overplanned.toFixed(2)}. Be cautious of future bookings.`,
          });
          break;
        case "HIGH_ACCOMMODATION":
          recommendations.push({
            id: "rec-high-accommodation",
            type: "info",
            title: "Lodging Concentration",
            message: `Lodging accounts for ${rule.meta?.percentage}% of your total planned budget. Look out for complimentary breakfast or hotel credits to maximize value.`,
          });
          break;
        case "HIGH_TRANSIT":
          recommendations.push({
            id: "rec-high-transit",
            type: "opportunity",
            title: "Transit Savings Potential",
            message: `Transit makes up ${rule.meta?.percentage}% of your budget. Consider purchasing a regional subway pass to save on point-to-point tickets.`,
            savingsAmount: 45,
          });
          break;
        case "UNPAID_ACTIVITIES":
          recommendations.push({
            id: "rec-unpaid-activities",
            type: "alert",
            title: "Unpaid Bookings Alert",
            message: `You have ${rule.meta?.count} unpaid activities scheduled. Book them early to lock in current pricing before they increase.`,
          });
          break;
        case "SAVINGS_FOUND":
          recommendations.push({
            id: "rec-savings-found",
            type: "opportunity",
            title: "Premium Attraction Discount",
            message: `We found alternative booking options for "${rule.meta?.sample}". Booking through our regional partner could save you up to 15%.`,
            savingsAmount: 25,
          });
          break;
      }
    });

    // Baseline recommendation if no rules triggered
    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec-baseline",
        type: "info",
        title: "Finance System Status",
        message: "Your spending pacing and budget allocation are fully optimized. Keep it up!",
      });
    }

    // Add a generic emergency fund recommendation
    recommendations.push({
      id: "rec-emergency-buffer",
      type: "info",
      title: "Emergency Buffer Recommendation",
      message: `We have reserved $${(context.totalBudget * 0.1).toFixed(0)} (10%) of your budget as an emergency buffer. Try not to allocate this to planned events.`,
    });

    return recommendations;
  }
}
