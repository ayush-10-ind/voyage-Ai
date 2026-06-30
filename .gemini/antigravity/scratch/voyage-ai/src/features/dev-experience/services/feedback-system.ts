export interface FeedbackItem {
  id: string;
  type: "bug" | "feature_request" | "general";
  rating?: number;
  comment: string;
  timestamp: string;
}

class FeedbackSystemService {
  private items: FeedbackItem[] = [];

  /**
   * Submits feedback.
   */
  submitFeedback(type: FeedbackItem["type"], comment: string, rating?: number): FeedbackItem {
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      type,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };
    
    this.items.push(newItem);
    console.log("Feedback recorded:", newItem);
    return newItem;
  }

  /**
   * Gets all feedback items (useful for dev dashboard).
   */
  getFeedback(): FeedbackItem[] {
    return this.items;
  }
}

export const FeedbackSystem = new FeedbackSystemService();
