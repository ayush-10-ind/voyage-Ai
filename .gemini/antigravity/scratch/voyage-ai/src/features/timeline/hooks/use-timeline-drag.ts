import { useState } from "react";
import { useTimelineStore } from "../store/use-timeline-store";

/**
 * Custom hook to abstract HTML5 Drag and Drop events.
 * Keeps the UI components decoupled from the underlying drag logic,
 * allowing easy swap to other libraries (e.g. @dnd-kit) in the future.
 */
export function useTimelineDrag() {
  const moveActivity = useTimelineStore((state) => state.moveActivity);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    activityId: string,
    dayNumber: number,
    index: number
  ) => {
    setDraggingId(activityId);
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ activityId, fromDayNumber: dayNumber, fromIndex: index })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toDayNumber: number, toIndex?: number) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      const { fromDayNumber, fromIndex } = JSON.parse(rawData);
      moveActivity(fromDayNumber, fromIndex, toDayNumber, toIndex);
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  return {
    draggingId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}
