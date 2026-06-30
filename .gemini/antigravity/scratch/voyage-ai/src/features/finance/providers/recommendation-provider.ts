import { Activity, ExpenseItem } from "../../timeline/types";

export interface FinanceRecommendation {
  id: string;
  type: "warning" | "opportunity" | "info" | "alert";
  title: string;
  message: string;
  savingsAmount?: number;
}

export interface RecommendationContext {
  totalBudget: number;
  plannedSpend: number;
  actualSpend: number;
  daysCount: number;
  activities: Activity[];
  manualExpenses: ExpenseItem[];
}

export interface FinanceRecommendationProvider {
  getRecommendations(context: RecommendationContext): Promise<FinanceRecommendation[]>;
}
