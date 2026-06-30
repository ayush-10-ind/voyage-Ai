import { create } from "zustand";
import { Trip, Day, Activity, ActivityCategory, ExpenseItem } from "../types";
import { toast } from "sonner";
import { VoyageEventBus } from "@/lib/voyage-event-bus";
import { TravelIntelligenceEngine } from "@/features/travel-intelligence/domain/travel-intelligence-engine";

interface TimelineState {
  trip: Trip | null;
  selectedActivityId: string | null;
  editingActivityId: string | null;
  expandedActivityIds: Set<string>;
  searchQuery: string;
  categoryFilter: ActivityCategory | "all";
  viewMode: "timeline" | "split" | "map-focus";
  
  // History Stack
  history: Trip[];
  future: Trip[];

  initializeFromItinerary: (itinerary: any, destinationName: string) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (filter: ActivityCategory | "all") => void;
  setViewMode: (mode: "timeline" | "split" | "map-focus") => void;
  selectActivity: (id: string | null) => void;
  setEditingActivity: (id: string | null) => void;
  toggleExpandActivity: (id: string) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  
  // Operations
  addActivity: (dayNumber: number, activity: Omit<Activity, "id">) => void;
  updateActivity: (dayNumber: number, activityId: string, updatedFields: Partial<Activity>) => void;
  deleteActivity: (dayNumber: number, activityId: string) => void;
  duplicateActivity: (dayNumber: number, activityId: string) => void;
  moveActivity: (fromDayNumber: number, fromIndex: number, toDayNumber: number, toIndex?: number) => void;

  // Finance Engine Actions
  setTotalBudget: (amount: number) => void;
  setCurrency: (code: string) => void;
  addManualExpense: (expense: Omit<ExpenseItem, "id">) => void;
  updateManualExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  deleteManualExpense: (id: string) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
  // Helper to push current state to history stack
  const pushState = (newTrip: Trip) => {
    const { trip, history } = get();
    if (!trip) return;
    
    set({
      history: [...history, JSON.parse(JSON.stringify(trip))].slice(-50), // Limit to 50 states
      future: [],
      trip: newTrip,
    });
  };

  return {
    trip: null,
    selectedActivityId: null,
    editingActivityId: null,
    expandedActivityIds: new Set<string>(),
    searchQuery: "",
    categoryFilter: "all",
    viewMode: "timeline",
    history: [],
    future: [],

    initializeFromItinerary: (itinerary, destinationName) => {
      if (!itinerary) return;

      // Check if already initialized to prevent reset on re-render
      if (get().trip && get().trip?.destination === destinationName) return;

      const parseCost = (costStr: string): number => {
        if (!costStr || costStr.toLowerCase().includes("free")) return 0;
        const num = parseFloat(costStr.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
      };

      // Map DayItinerary to Day
      const mappedDays: Day[] = itinerary.days.map((day: any, dIdx: number) => {
        const rawActivities = day.activities.map((act: any, aIdx: number) => {
          const travelModes: Array<"walking" | "driving" | "transit"> = ["walking", "driving", "transit"];
          const travelDurations = ["10m", "15m", "20m", "25m"];
          const travelDistances = ["0.5 km", "1.2 km", "2.5 km", "3.0 km"];
          const selectedMode = travelModes[(dIdx + aIdx) % travelModes.length];

          const travelToNext = aIdx < day.activities.length - 1 ? {
            mode: selectedMode,
            duration: travelDurations[(dIdx + aIdx) % travelDurations.length],
            distance: travelDistances[(dIdx + aIdx) % travelDistances.length],
            routeSummary: selectedMode === "walking" 
              ? "via local streets" 
              : selectedMode === "driving" 
                ? "via highway" 
                : "via metro line",
          } : undefined;

          const parsedPlanned = parseCost(act.cost);

          return {
            id: `act-${day.day}-${aIdx}-${Date.now()}`,
            time: act.time || "09:00 AM",
            duration: act.duration || "1h",
            title: act.title,
            description: act.description,
            cost: act.cost || "Free",
            category: (act.title.toLowerCase().includes("dinner") || 
                       act.title.toLowerCase().includes("lunch") || 
                       act.title.toLowerCase().includes("breakfast") || 
                       act.title.toLowerCase().includes("food")
                         ? "dining"
                         : act.title.toLowerCase().includes("train") || 
                           act.title.toLowerCase().includes("flight") || 
                           act.title.toLowerCase().includes("transit")
                             ? "transit"
                             : "sightseeing") as ActivityCategory,
            notes: "",
            isFavorite: false,
            travelToNext,
            plannedCost: parsedPlanned,
            actualCost: 0,
            paymentStatus: "unpaid" as const,
            paymentMethod: undefined,
            receiptUrl: undefined,
            refundStatus: "none" as const,
          };
        });

        // Enrich using TravelIntelligenceEngine!
        const enrichedActivities = TravelIntelligenceEngine.enrichActivities(destinationName, rawActivities);

        return {
          dayNumber: day.day,
          title: day.title || `Day ${day.day}`,
          activities: enrichedActivities,
        };
      });

      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        name: `Journey to ${destinationName}`,
        destination: destinationName,
        startDate: "Oct 12, 2026",
        endDate: "Oct 17, 2026",
        travelerCount: 2,
        days: mappedDays,
        totalBudget: 1500,
        currency: "USD",
        manualExpenses: [],
      };

      set({
        trip: newTrip,
        history: [],
        future: [],
        selectedActivityId: null,
        editingActivityId: null,
        expandedActivityIds: new Set(),
      });

      // Notify route/weather calculation on initialization
      VoyageEventBus.publish("ROUTE_RECALCULATED", newTrip);
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategoryFilter: (filter) => set({ categoryFilter: filter }),
    setViewMode: (mode) => set({ viewMode: mode }),
    selectActivity: (id) => set({ selectedActivityId: id }),
    setEditingActivity: (id) => set({ editingActivityId: id }),
    
    toggleExpandActivity: (id) => set((state) => {
      const next = new Set(state.expandedActivityIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedActivityIds: next };
    }),

    undo: () => {
      const { history, trip, future } = get();
      if (history.length === 0 || !trip) return;

      const previous = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      set({
        history: newHistory,
        future: [...future, JSON.parse(JSON.stringify(trip))],
        trip: previous,
      });
      toast.info("Undo action");
    },

    redo: () => {
      const { history, trip, future } = get();
      if (future.length === 0 || !trip) return;

      const next = future[future.length - 1];
      const newFuture = future.slice(0, -1);

      set({
        history: [...history, JSON.parse(JSON.stringify(trip))],
        future: newFuture,
        trip: next,
      });
      toast.info("Redo action");
    },

    addActivity: (dayNumber, activity) => {
      const { trip } = get();
      if (!trip) return;

      const newDays = trip.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const newAct: Activity = {
          ...activity,
          id: `act-${dayNumber}-${day.activities.length}-${Date.now()}`,
        };

        const rawActs = [...day.activities, newAct];
        const enrichedActs = TravelIntelligenceEngine.enrichActivities(trip.destination, rawActs);

        return {
          ...day,
          activities: enrichedActs,
        };
      });

      const updatedTrip = { ...trip, days: newDays };
      pushState(updatedTrip);
      
      VoyageEventBus.publish("ACTIVITY_ADDED", { dayNumber, activity });
      VoyageEventBus.publish("ROUTE_RECALCULATED", updatedTrip);
      toast.success("Activity added");
    },

    updateActivity: (dayNumber, activityId, updatedFields) => {
      const { trip } = get();
      if (!trip) return;

      const newDays = trip.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const updatedActs = day.activities.map((act) =>
          act.id === activityId ? { ...act, ...updatedFields } : act
        );
        const enrichedActs = TravelIntelligenceEngine.enrichActivities(trip.destination, updatedActs);

        return {
          ...day,
          activities: enrichedActs,
        };
      });

      const updatedTrip = { ...trip, days: newDays };
      pushState(updatedTrip);

      // Publish event if cost-related properties were modified
      if (
        "plannedCost" in updatedFields ||
        "actualCost" in updatedFields ||
        "paymentStatus" in updatedFields
      ) {
        VoyageEventBus.publish("ACTIVITY_COST_CHANGED", { activityId, updatedFields });
      }

      VoyageEventBus.publish("ACTIVITY_UPDATED", { activityId, updatedFields });
      VoyageEventBus.publish("ROUTE_RECALCULATED", updatedTrip);
      toast.success("Activity updated");
    },

    deleteActivity: (dayNumber, activityId) => {
      const { trip } = get();
      if (!trip) return;

      const newDays = trip.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const filteredActs = day.activities.filter((act) => act.id !== activityId);
        const enrichedActs = TravelIntelligenceEngine.enrichActivities(trip.destination, filteredActs);

        return {
          ...day,
          activities: enrichedActs,
        };
      });

      const updatedTrip = { ...trip, days: newDays };
      pushState(updatedTrip);
      
      VoyageEventBus.publish("ACTIVITY_COST_CHANGED", { activityId, deleted: true });
      VoyageEventBus.publish("ACTIVITY_DELETED", { activityId });
      VoyageEventBus.publish("ROUTE_RECALCULATED", updatedTrip);
      toast.error("Activity deleted");
    },

    duplicateActivity: (dayNumber, activityId) => {
      const { trip } = get();
      if (!trip) return;

      const newDays = trip.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const targetIdx = day.activities.findIndex((act) => act.id === activityId);
        if (targetIdx === -1) return day;

        const original = day.activities[targetIdx];
        const copy: Activity = {
          ...original,
          id: `act-${dayNumber}-${day.activities.length}-${Date.now()}`,
          title: `${original.title} (Copy)`,
        };

        const nextActivities = [...day.activities];
        nextActivities.splice(targetIdx + 1, 0, copy);
        const enrichedActs = TravelIntelligenceEngine.enrichActivities(trip.destination, nextActivities);

        return {
          ...day,
          activities: enrichedActs,
        };
      });

      const updatedTrip = { ...trip, days: newDays };
      pushState(updatedTrip);
      
      VoyageEventBus.publish("ROUTE_RECALCULATED", updatedTrip);
      toast.success("Activity duplicated");
    },

    moveActivity: (fromDayNumber, fromIndex, toDayNumber, toIndex) => {
      const { trip } = get();
      if (!trip) return;

      const fromDay = trip.days.find((d) => d.dayNumber === fromDayNumber);
      const toDay = trip.days.find((d) => d.dayNumber === toDayNumber);
      if (!fromDay || !toDay) return;

      const activity = fromDay.activities[fromIndex];
      if (!activity) return;

      // 1. Move activities in raw state
      let tempDays = trip.days.map((day) => {
        // Remove from source day
        if (day.dayNumber === fromDayNumber) {
          const nextActs = day.activities.filter((_, idx) => idx !== fromIndex);
          return { ...day, activities: nextActs };
        }
        
        // Add to target day
        if (day.dayNumber === toDayNumber) {
          const nextActs = [...day.activities];
          const insertIdx = toIndex !== undefined ? toIndex : nextActs.length;
          nextActs.splice(insertIdx, 0, activity);
          return { ...day, activities: nextActs };
        }

        return day;
      });

      // 2. Re-enrich coordinates/travel intelligence for affected days
      const newDays = tempDays.map((day) => {
        if (day.dayNumber === fromDayNumber || day.dayNumber === toDayNumber) {
          return {
            ...day,
            activities: TravelIntelligenceEngine.enrichActivities(trip.destination, day.activities),
          };
        }
        return day;
      });

      const updatedTrip = { ...trip, days: newDays };
      pushState(updatedTrip);
      
      VoyageEventBus.publish("ROUTE_RECALCULATED", updatedTrip);
      toast.info(`Moved activity to Day ${toDayNumber}`);
    },

    setTotalBudget: (amount) => {
      const { trip } = get();
      if (!trip) return;
      const updatedTrip = { ...trip, totalBudget: amount };
      pushState(updatedTrip);
      VoyageEventBus.publish("BUDGET_CHANGED", { totalBudget: amount });
      toast.success(`Budget updated to $${amount}`);
    },

    setCurrency: (code) => {
      const { trip } = get();
      if (!trip) return;
      const updatedTrip = { ...trip, currency: code };
      pushState(updatedTrip);
      VoyageEventBus.publish("CURRENCY_CHANGED", { currency: code });
      toast.success(`Currency changed to ${code}`);
    },

    addManualExpense: (expense) => {
      const { trip } = get();
      if (!trip) return;
      const newExpense: ExpenseItem = {
        ...expense,
        id: `exp-${Date.now()}`,
      };
      const updatedTrip = {
        ...trip,
        manualExpenses: [...(trip.manualExpenses || []), newExpense],
      };
      pushState(updatedTrip);
      VoyageEventBus.publish("EXPENSE_RECORDED", { type: "add", expense: newExpense });
      toast.success(`Expense "${expense.title}" logged`);
    },

    updateManualExpense: (id, updates) => {
      const { trip } = get();
      if (!trip) return;
      const updatedExpenses = (trip.manualExpenses || []).map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      );
      const updatedTrip = { ...trip, manualExpenses: updatedExpenses };
      pushState(updatedTrip);
      VoyageEventBus.publish("EXPENSE_RECORDED", { type: "update", id, updates });
      toast.success("Expense updated");
    },

    deleteManualExpense: (id) => {
      const { trip } = get();
      if (!trip) return;
      const updatedExpenses = (trip.manualExpenses || []).filter((exp) => exp.id !== id);
      const updatedTrip = { ...trip, manualExpenses: updatedExpenses };
      pushState(updatedTrip);
      VoyageEventBus.publish("EXPENSE_RECORDED", { type: "delete", id });
      toast.error("Expense deleted");
    },
  };
});
