import { Trip } from "../../timeline/types";
import { BudgetMetrics } from "./budget-engine";

export interface SimulationScenario {
  type: "increase_duration" | "reduce_budget" | "upgrade_hotels" | "add_attractions" | "change_transportation";
  params: Record<string, any>;
}

export interface SimulationResult {
  scenarioType: string;
  originalMetrics: BudgetMetrics;
  simulatedMetrics: BudgetMetrics;
  impactDescription: string;
  recommendedAdjustments: string[];
}

export class SimulationEngine {
  /**
   * Run a hypothetical budget scenario simulation.
   * Currently, this acts as an architectural extension point.
   */
  static simulate(
    trip: Trip,
    scenario: SimulationScenario
  ): SimulationResult {
    // 1. Calculate original metrics
    const originalActivities = trip.days.flatMap((d) => d.activities);
    const originalMetrics = {
      totalBudget: trip.totalBudget || 1500,
      totalPlannedSpend: originalActivities.reduce((sum, act) => sum + (act.plannedCost || 0), 0) + (trip.manualExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0),
      totalActualSpend: originalActivities.reduce((sum, act) => sum + (act.actualCost || 0), 0) + (trip.manualExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0),
      remainingBudget: 0,
      dailyBudget: 0,
      emergencyBuffer: 0,
      healthScore: 85,
    };

    // 2. Prepare simulated structures
    let simulatedBudget = trip.totalBudget || 1500;
    let impactDescription = "";
    const recommendedAdjustments: string[] = [];

    // 3. Evaluate scenario parameters (Extension Point)
    switch (scenario.type) {
      case "reduce_budget": {
        const reductionAmount = scenario.params.reductionAmount || 200;
        simulatedBudget = Math.max(0, simulatedBudget - reductionAmount);
        impactDescription = `Reducing the total budget by $${reductionAmount} will lower the daily spending allowance.`;
        recommendedAdjustments.push("Consider downgrading high-cost sightseeing events.");
        recommendedAdjustments.push("Opt for walking or public transit over private rides.");
        break;
      }
      case "increase_duration": {
        const additionalDays = scenario.params.additionalDays || 2;
        impactDescription = `Adding ${additionalDays} days to the trip increases lodging and dining requirements.`;
        recommendedAdjustments.push("Increase total budget allocation to maintain the current daily spending pace.");
        break;
      }
      case "upgrade_hotels": {
        impactDescription = "Upgrading accommodations will increase lodging expenses significantly.";
        recommendedAdjustments.push("Reduce dining out or activities budget to offset hotel upgrade costs.");
        break;
      }
      case "add_attractions": {
        impactDescription = "Adding premium attractions will increase the planned activities budget.";
        recommendedAdjustments.push("Book tickets in advance to secure group or early-bird discounts.");
        break;
      }
      case "change_transportation": {
        impactDescription = "Switching transportation modes will affect both travel time and cost.";
        recommendedAdjustments.push("Compare regional rail passes against point-to-point tickets.");
        break;
      }
      default:
        impactDescription = "Running baseline simulation. No parameters changed.";
        break;
    }

    // Return mock simulated results to demonstrate the extension point
    const simulatedMetrics: BudgetMetrics = {
      ...originalMetrics,
      totalBudget: simulatedBudget,
      remainingBudget: Math.max(0, simulatedBudget - originalMetrics.totalActualSpend),
      dailyBudget: trip.days.length > 0 ? Math.max(0, simulatedBudget - originalMetrics.totalActualSpend) / trip.days.length : 0,
      healthScore: Math.max(0, originalMetrics.healthScore - (simulatedBudget < originalMetrics.totalPlannedSpend ? 15 : 0)),
    };

    return {
      scenarioType: scenario.type,
      originalMetrics,
      simulatedMetrics,
      impactDescription,
      recommendedAdjustments,
    };
  }
}
