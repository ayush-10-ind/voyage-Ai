import { VoyageLogger } from "@/lib/logger";

export interface AIProvider {
  id: string;
  name: string;
  generateItinerary(prompt: string, context: any): Promise<any>;
  chat(message: string, context: any): Promise<string>;
}

export class MockAIProvider implements AIProvider {
  id = "mock-gemini";
  name = "Voyage AI Gemini Flash (Simulated)";

  async generateItinerary(prompt: string, context: any): Promise<any> {
    VoyageLogger.info("AIProvider", `Generating itinerary with prompt: "${prompt}"`);
    // Simulated AI latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return a basic mock itinerary layout
    return {
      destination: "Tokyo, Japan",
      budget: { total: "$1200" },
      days: [
        {
          day: 1,
          title: "Historic Asakusa & Modern Akihabara",
          activities: [
            { time: "09:00 AM", title: "Senso-ji Temple Tour", description: "Explore Tokyo's oldest Buddhist temple.", cost: "Free" },
            { time: "01:30 PM", title: "Lunch at Asakusa Imahan", description: "Sample traditional Sukiyaki.", cost: "$45" },
            { time: "04:00 PM", title: "Explore Akihabara Electric Town", description: "Walk through retro gaming shops.", cost: "Free" },
          ]
        }
      ]
    };
  }

  async chat(message: string, context: any): Promise<string> {
    VoyageLogger.info("AIProvider", `Chatting with message: "${message}"`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (message.toLowerCase().includes("budget") || message.toLowerCase().includes("cost")) {
      return "Based on your budget context, you have 65% of your total funds remaining. Your daily pacing is well within bounds, but you have a warning for a potential cost overrun on day 3 due to lodging.";
    }

    return `I received your message about the trip. The weather forecast looks favorable, and your route logistics are optimized. How can I help you adjust the schedule?`;
  }
}
