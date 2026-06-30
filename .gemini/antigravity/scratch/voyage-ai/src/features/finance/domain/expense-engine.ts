import { Activity, ExpenseItem } from "../../timeline/types";

export interface ExpenseSummary {
  totalCount: number;
  paidCount: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  byPaymentMethod: Record<string, number>;
}

export class ExpenseEngine {
  /**
   * Summarizes all expenses (activities + manual) in the trip.
   */
  static summarizeExpenses(
    activities: Activity[],
    manualExpenses: ExpenseItem[]
  ): ExpenseSummary {
    let paidCount = 0;
    let unpaidCount = 0;
    let partiallyPaidCount = 0;
    const byPaymentMethod: Record<string, number> = {};

    // Process activities
    activities.forEach((act) => {
      if (act.paymentStatus === "paid") paidCount++;
      else if (act.paymentStatus === "partially_paid") partiallyPaidCount++;
      else unpaidCount++;

      if (act.paymentMethod) {
        byPaymentMethod[act.paymentMethod] = (byPaymentMethod[act.paymentMethod] || 0) + (act.actualCost ?? act.plannedCost ?? 0);
      }
    });

    // Process manual expenses (assumed paid)
    manualExpenses.forEach((exp) => {
      paidCount++;
      if (exp.paymentMethod) {
        byPaymentMethod[exp.paymentMethod] = (byPaymentMethod[exp.paymentMethod] || 0) + exp.amount;
      } else {
        byPaymentMethod["other"] = (byPaymentMethod["other"] || 0) + exp.amount;
      }
    });

    return {
      totalCount: activities.length + manualExpenses.length,
      paidCount,
      unpaidCount,
      partiallyPaidCount,
      byPaymentMethod,
    };
  }
}
