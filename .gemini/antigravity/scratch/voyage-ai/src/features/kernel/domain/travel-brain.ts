import { Trip } from "../../timeline/types";
import { AIContextManager, GlobalAIContext } from "../../copilot/domain/ai-context-manager";
import { VoyageLogger } from "@/lib/logger";

/**
 * Aggregates structured context from every subsystem in the application.
 */
export class ContextAggregator {
  /**
   * Consolidates all system states into a single unified travel context.
   */
  static aggregate(trip: Trip, preferences?: any): GlobalAIContext & { userPreferences?: any } {
    VoyageLogger.info("Navigation", "Transition: Finance → Travel Brain (Aggregating Subsystem Context)");
    VoyageLogger.debug("TravelBrain", "Aggregating global subsystem context...");
    
    // Delegate to the AIContextManager to collect timeline, finance, weather, and route details
    const baseContext = AIContextManager.getGlobalContext(trip);

    return {
      ...baseContext,
      userPreferences: preferences || {},
    };
  }
}

/**
 * Determines what context is relevant for AI providers based on the query or task.
 * Filters out noise, structures the payload, and prevents token overflow.
 */
export class ReasoningPreparer {
  /**
   * Filters and prepares the aggregated context for the AI model.
   */
  static prepare(
    aggregatedContext: ReturnType<typeof ContextAggregator.aggregate>,
    query?: string
  ): any {
    VoyageLogger.debug("TravelBrain", `Preparing reasoning context for query: "${query || "none"}"`);

    // If there's no query, return a balanced summary
    if (!query) {
      return {
        tripName: aggregatedContext.tripName,
        destination: aggregatedContext.destination,
        financials: aggregatedContext.financials,
        logistics: aggregatedContext.logistics,
        daysCount: aggregatedContext.daysCount,
      };
    }

    const lowercaseQuery = query.toLowerCase();

    // Query relates to money/budget: prioritize financial context
    if (lowercaseQuery.includes("budget") || lowercaseQuery.includes("cost") || lowercaseQuery.includes("expense") || lowercaseQuery.includes("pay")) {
      return {
        focus: "finance",
        destination: aggregatedContext.destination,
        financials: aggregatedContext.financials,
        activities: aggregatedContext.activities.map(act => ({
          title: act.title,
          plannedCost: act.plannedCost,
          actualCost: act.actualCost,
          paymentStatus: act.paymentStatus,
        })),
      };
    }

    // Query relates to routes, distance, or mapping: prioritize logistics
    if (lowercaseQuery.includes("map") || lowercaseQuery.includes("route") || lowercaseQuery.includes("walk") || lowercaseQuery.includes("drive") || lowercaseQuery.includes("distance")) {
      return {
        focus: "logistics",
        destination: aggregatedContext.destination,
        logistics: aggregatedContext.logistics,
        activities: aggregatedContext.activities.map(act => ({
          title: act.title,
          time: act.time,
          coordinates: act.coordinates,
        })),
      };
    }

    // Default: return complete structured context
    return aggregatedContext;
  }
}

/**
 * The Travel Brain orchestrates context aggregation and reasoning preparation.
 */
export class TravelBrain {
  /**
   * Generates the optimized context for the AI Copilot.
   */
  static getContextForAI(trip: Trip, preferences: any, query?: string): any {
    const fullContext = ContextAggregator.aggregate(trip, preferences);
    return ReasoningPreparer.prepare(fullContext, query);
  }
}
