import { create } from "zustand";
import { ChatMessage, TripPreferences, TripItinerary } from "../types";
import { mockCopilotService } from "@/services/ai/copilot-service";
import { VoyageLogger } from "@/lib/logger";

interface CopilotState {
  messages: ChatMessage[];
  currentStep: number; // 0: Destination, 1: Duration, 2: Style, 3: Budget, 4: Interests, 5: Companions, 6: Generating, 7: Finished
  preferences: TripPreferences;
  itinerary: TripItinerary | null;
  isGenerating: boolean;
  isStreaming: boolean;
  streamingText: string;
  draftSaved: boolean;
  
  initializeCopilot: (preselectedDestination?: string) => void;
  submitAnswer: (answer: string) => void;
  editAnswer: (stepIndex: number, newValue: string) => void;
  regenerateItinerary: () => void;
  updateItinerary: (itinerary: TripItinerary) => void;
  saveDraft: () => void;
  resetCopilot: () => void;
}

const QUESTIONS = [
  "Where would you like to travel? Choose one of our featured destinations or enter any city.",
  "How many days will your journey be?",
  "What is your preferred travel pace? (Relaxed, Balanced, or Fast-paced)",
  "What is your budget level? (Budget, Moderate, or Luxury)",
  "What are your main interests? (e.g., Food, Nature, History, Adventure)",
  "Who are you traveling with? (Solo, Couple, Family, or Friends)",
];

const SUGGESTIONS = [
  ["Tokyo", "Zermatt", "Reykjavik", "Ubud", "Tromsø"],
  ["3 Days", "5 Days", "7 Days", "10 Days"],
  ["Relaxed", "Balanced", "Fast-paced"],
  ["Budget", "Moderate", "Luxury"],
  ["Food & Dining", "Nature & Outdoors", "History & Culture", "Adventure"],
  ["Solo", "Couple", "Family", "Friends"],
];

export const useCopilotStore = create<CopilotState>((set, get) => ({
  messages: [],
  currentStep: 0,
  preferences: {},
  itinerary: null,
  isGenerating: false,
  isStreaming: false,
  streamingText: "",
  draftSaved: false,

  initializeCopilot: (preselectedDestination) => {
    // If already initialized, don't reset
    if (get().messages.length > 0) return;

    const initialMessages: ChatMessage[] = [
      {
        id: "welcome",
        sender: "copilot",
        content: "Hello! I am your Voyage AI Travel Copilot. Let's design your perfect journey together. First, where would you like to travel?",
        timestamp: new Date(),
        suggestions: SUGGESTIONS[0],
      },
    ];

    if (preselectedDestination) {
      set({
        messages: [
          ...initialMessages,
          {
            id: "pre-dest-user",
            sender: "user",
            content: preselectedDestination,
            timestamp: new Date(),
          },
          {
            id: "pre-dest-reply",
            sender: "copilot",
            content: `Excellent choice! Let's plan a trip to ${preselectedDestination}. ${QUESTIONS[1]}`,
            timestamp: new Date(),
            suggestions: SUGGESTIONS[1],
          },
        ],
        currentStep: 1,
        preferences: { destination: preselectedDestination },
      });
    } else {
      set({
        messages: initialMessages,
        currentStep: 0,
        preferences: {},
      });
    }
  },

  updateItinerary: (itinerary) => {
    // Re-calculate total budget when itinerary is updated
    const accommodationCost = itinerary.budget.breakdown.find(b => b.category === "Accommodation" || b.category === "Hotels");
    const otherCosts = itinerary.days.reduce((sum, day) => {
      const dayActivitiesCost = day.activities.reduce((dSum, act) => {
        const num = parseFloat(act.cost?.replace(/[^0-9.]/g, "") || "0");
        return dSum + num;
      }, 0);
      const dayRestCost = day.restaurants.reduce((rSum, rest) => {
        const num = parseFloat(rest.cost?.replace(/[^0-9.]/g, "") || "0");
        return rSum + num;
      }, 0);
      return sum + dayActivitiesCost + dayRestCost;
    }, 0);

    const accomNum = parseFloat(accommodationCost?.cost.replace(/[^0-9.]/g, "") || "0");
    const totalNum = accomNum + otherCosts;

    const updatedItinerary = {
      ...itinerary,
      budget: {
        total: `$${totalNum.toLocaleString()}`,
        breakdown: [
          { category: "Accommodation", cost: accommodationCost?.cost || "$0" },
          { category: "Activities & Dining", cost: `$${otherCosts.toLocaleString()}` }
        ]
      }
    };

    set({ itinerary: updatedItinerary });
  },

  submitAnswer: async (answer) => {
    const { currentStep, messages, preferences } = get();
    
    // 1. Add User's Answer Message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: answer,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];

    // 2. Parse and Update Preferences based on current step
    const updatedPrefs = { ...preferences };
    if (currentStep === 0) updatedPrefs.destination = answer;
    else if (currentStep === 1) updatedPrefs.duration = parseInt(answer) || 5;
    else if (currentStep === 2) {
      const styleVal = answer.toLowerCase();
      const style = styleVal.includes("relax") ? "relaxed" : styleVal.includes("fast") ? "fast-paced" : "balanced";
      updatedPrefs.style = style;
      updatedPrefs.travelStyle = style;
    } else if (currentStep === 3) {
      const budgetVal = answer.toLowerCase();
      updatedPrefs.budget = budgetVal.includes("lux") ? "luxury" : budgetVal.includes("bud") ? "budget" : "moderate";
    } else if (currentStep === 4) {
      updatedPrefs.interests = answer.split(",").map(i => i.trim());
    } else if (currentStep === 5) {
      const compVal = answer.toLowerCase();
      let companions: "solo" | "couple" | "family" | "friends" = "solo";
      let travelers = 1;
      let accommodationType = "single room";
      
      if (compVal.includes("couple")) {
        companions = "couple";
        travelers = 2;
        accommodationType = "double room";
      } else if (compVal.includes("fam")) {
        companions = "family";
        travelers = 4;
        accommodationType = "family suite";
      } else if (compVal.includes("friend")) {
        companions = "friends";
        travelers = 3;
        accommodationType = "shared rooms";
      }
      
      updatedPrefs.companions = companions;
      updatedPrefs.travelers = travelers;
      updatedPrefs.accommodationType = accommodationType;

      // Set transportationPreference based on budget
      updatedPrefs.transportationPreference = 
        updatedPrefs.budget === "luxury" ? "private transfers" :
        updatedPrefs.budget === "budget" ? "public transport" : "transit / rideshare";
    }

    const nextStep = currentStep + 1;

    // 3. Check if we need to ask more questions
    if (nextStep < QUESTIONS.length) {
      const copilotQuestion: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        content: QUESTIONS[nextStep],
        timestamp: new Date(),
        suggestions: SUGGESTIONS[nextStep],
      };

      set({
        messages: [...updatedMessages, copilotQuestion],
        currentStep: nextStep,
        preferences: updatedPrefs,
      });
    } else {
      // All questions answered, generate itinerary!
      VoyageLogger.info("Navigation", "Transition: Copilot → Trip Generation (Generating custom itinerary via mockCopilotService)");
      set({
        messages: updatedMessages,
        currentStep: 6, // Generating state
        preferences: updatedPrefs,
        isGenerating: true,
        isStreaming: true,
        streamingText: "",
      });

      try {
        // Call AI Service with streaming simulation
        const finalItinerary = await mockCopilotService.generateItinerary(
          updatedPrefs,
          (chunk) => {
            set((state) => ({ streamingText: state.streamingText + chunk }));
          }
        );

        // Add final copilot message
        const finalMessage: ChatMessage = {
          id: `copilot-final-${Date.now()}`,
          sender: "copilot",
          content: `I have generated your custom itinerary for ${updatedPrefs.destination || "your trip"}! Scroll down or view the summary panel to explore your travel details.`,
          timestamp: new Date(),
        };

        set({
          messages: [...get().messages, finalMessage],
          itinerary: finalItinerary,
          currentStep: 7, // Finished
          isGenerating: false,
          isStreaming: false,
        });
      } catch (error) {
        // Error Recovery
        set({
          messages: [
            ...get().messages,
            {
              id: `copilot-err-${Date.now()}`,
              sender: "copilot",
              content: "I encountered an issue while generating your itinerary. Would you like to try again?",
              timestamp: new Date(),
              suggestions: ["Regenerate Itinerary"],
            },
          ],
          isGenerating: false,
          isStreaming: false,
        });
      }
    }
  },

  editAnswer: (stepIndex, newValue) => {
    const { messages } = get();
    
    // Find the user message corresponding to that step
    // The user messages are at odd indices in the simple welcome -> user -> copilot -> user flow
    // To be safe, we rebuild preferences and reset currentStep to that step to allow reprocessing
    const newPrefs = { ...get().preferences };
    
    if (stepIndex === 0) newPrefs.destination = newValue;
    else if (stepIndex === 1) newPrefs.duration = parseInt(newValue) || 5;
    else if (stepIndex === 2) {
      const styleVal = newValue.toLowerCase();
      newPrefs.style = styleVal.includes("relax") ? "relaxed" : styleVal.includes("fast") ? "fast-paced" : "balanced";
    } else if (stepIndex === 3) {
      const budgetVal = newValue.toLowerCase();
      newPrefs.budget = budgetVal.includes("lux") ? "luxury" : budgetVal.includes("bud") ? "budget" : "moderate";
    } else if (stepIndex === 4) {
      newPrefs.interests = newValue.split(",").map(i => i.trim());
    } else if (stepIndex === 5) {
      const compVal = newValue.toLowerCase();
      newPrefs.companions = compVal.includes("couple") ? "couple" : compVal.includes("fam") ? "family" : compVal.includes("friend") ? "friends" : "solo";
    }

    // Reset the conversation messages up to that edit point and re-submit
    const userMsgCount = stepIndex + (get().messages[0]?.id === "welcome" ? 1 : 0);
    let count = 0;
    const truncatedMessages = messages.filter((msg) => {
      if (msg.sender === "user") {
        count++;
        return count <= stepIndex;
      }
      return count < stepIndex;
    });

    set({
      preferences: newPrefs,
      itinerary: null,
      messages: truncatedMessages,
      currentStep: stepIndex,
    });

    // Re-submit the new answer
    get().submitAnswer(newValue);
  },

  regenerateItinerary: () => {
    const { preferences } = get();
    set({ itinerary: null, currentStep: 5 });
    get().submitAnswer(preferences.companions || "Solo");
  },

  saveDraft: () => {
    set({ draftSaved: true });
    setTimeout(() => set({ draftSaved: false }), 3000);
  },

  resetCopilot: () => {
    set({
      messages: [],
      currentStep: 0,
      preferences: {},
      itinerary: null,
      isGenerating: false,
      isStreaming: false,
      streamingText: "",
      draftSaved: false,
    });
  },
}));
