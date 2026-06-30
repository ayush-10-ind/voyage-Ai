import { Trip } from "../../timeline/types";
import { BudgetEngine } from "../../finance/domain/budget-engine";
import { RouteEngine } from "../../map/domain/route-engine";

export interface GlobalAIContext {
  tripName: string;
  destination: string;
  daysCount: number;
  financials: {
    totalBudget: number;
    plannedSpend: number;
    actualSpend: number;
    remainingBudget: number;
    healthScore: number;
  };
  logistics: {
    totalTravelTimeMin: number;
    totalTravelDistanceKm: number;
    scenicScore: number;
    carbonFootprintKg: number;
    modesUsed: string[];
  };
  activities: Array<{
    id: string;
    dayNumber: number;
    time: string;
    title: string;
    category: string;
    plannedCost: number;
    actualCost: number;
    paymentStatus: string;
    coordinates?: { lat: number; lng: number };
    safetyScore?: number;
    crowdLevel?: string;
  }>;
}

export class AIContextManager {
  /**
   * Consolidates all subsystems' data models (Finance, Route, Timeline, Weather)
   * into a single unified global AI Context payload.
   */
  static getGlobalContext(trip: Trip): GlobalAIContext {
    const activities = trip.days.flatMap((d) => 
      d.activities.map((act) => ({ ...act, dayNumber: d.dayNumber }))
    );
    const manualExpenses = trip.manualExpenses || [];

    // 1. Calculate Financials
    const budgetMetrics = BudgetEngine.calculateMetrics(
      trip.totalBudget || 1500,
      trip.days.length || 1,
      activities,
      manualExpenses
    );

    // 2. Calculate Logistics
    const routeSummary = RouteEngine.calculateRouteSummary(activities);

    // 3. Map Activities
    const mappedActivities = activities.map((act) => ({
      id: act.id,
      dayNumber: act.dayNumber,
      time: act.time,
      title: act.title,
      category: act.category,
      plannedCost: act.plannedCost || 0,
      actualCost: act.actualCost || 0,
      paymentStatus: act.paymentStatus || "unpaid",
      coordinates: act.coordinates,
      safetyScore: act.safetyScore,
      crowdLevel: act.crowdLevel,
    }));

    return {
      tripName: trip.name,
      destination: trip.destination,
      daysCount: trip.days.length,
      financials: {
        totalBudget: budgetMetrics.totalBudget,
        plannedSpend: budgetMetrics.totalPlannedSpend,
        actualSpend: budgetMetrics.totalActualSpend,
        remainingBudget: budgetMetrics.remainingBudget,
        healthScore: budgetMetrics.healthScore,
      },
      logistics: {
        totalTravelTimeMin: routeSummary.totalDurationMin,
        totalTravelDistanceKm: routeSummary.totalDistanceKm,
        scenicScore: routeSummary.scenicScore,
        carbonFootprintKg: routeSummary.carbonScoreKg,
        modesUsed: routeSummary.modesUsed,
      },
      activities: mappedActivities,
    };
  }
}
