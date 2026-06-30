import { VoyageEventBus } from "../../../lib/voyage-event-bus";

// Re-export VoyageEventBus as FinanceEventBus for backward compatibility
export const FinanceEventBus = VoyageEventBus;
export type FinanceEventType = import("../../../lib/voyage-event-bus").VoyageEventType;
export type FinanceEventCallback = import("../../../lib/voyage-event-bus").VoyageEventCallback;
