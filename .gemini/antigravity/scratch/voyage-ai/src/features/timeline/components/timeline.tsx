"use client";

import React, { useState } from "react";
import { useTimelineStore } from "../store/use-timeline-store";
import { TimelineDay } from "./timeline-day";
import { ActivityDialog } from "./activity-dialog";
import { useTimelineDrag } from "../hooks/use-timeline-drag";
import { Activity } from "../types";

export function Timeline() {
  const {
    trip,
    searchQuery,
    categoryFilter,
    addActivity,
    updateActivity,
    deleteActivity,
    selectActivity,
  } = useTimelineStore();

  const { handleDragOver, handleDrop } = useTimelineDrag();

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [activeValues, setActiveValues] = useState<Activity | null>(null);

  if (!trip) return null;

  // Open add dialog
  const openAddDialog = (dayNumber: number) => {
    setDialogMode("add");
    setActiveDay(dayNumber);
    setActiveValues(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (dayNumber: number, activity: Activity) => {
    setDialogMode("edit");
    setActiveDay(dayNumber);
    setActiveValues(activity);
    setDialogOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = (data: Omit<Activity, "id">) => {
    if (activeDay === null) return;

    if (dialogMode === "add") {
      addActivity(activeDay, data);
    } else if (dialogMode === "edit" && activeValues) {
      updateActivity(activeDay, activeValues.id, data);
    }
    setDialogOpen(false);
  };

  return (
    <div 
      className="w-full flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex gap-6 pb-6 pointer-events-auto items-stretch h-[550px] min-h-[500px]"
    >
      <div className="flex gap-6 min-w-max items-stretch px-1">
        {trip.days.map((day) => {
          // Filter activities based on search and category filter
          const filteredActivities = day.activities.filter((act) => {
            const matchesSearch =
              act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              act.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
              categoryFilter === "all" || act.category === categoryFilter;
            return matchesSearch && matchesCategory;
          });

          // Create a filtered day object for rendering
          const filteredDay = {
            ...day,
            activities: filteredActivities,
          };

          return (
            <div
              key={day.dayNumber}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.dayNumber)}
              className="w-[300px] shrink-0 flex flex-col h-full"
            >
              <TimelineDay
                day={filteredDay}
                onAddActivity={() => openAddDialog(day.dayNumber)}
                onEditActivity={(idx) => {
                  const act = filteredActivities[idx];
                  if (act) openEditDialog(day.dayNumber, act);
                }}
                onDeleteActivity={(idx) => {
                  const act = filteredActivities[idx];
                  if (act) {
                    deleteActivity(day.dayNumber, act.id);
                    selectActivity(null); // Clear selection if deleted
                  }
                }}
                onMoveActivity={() => {
                  // Managed via HTML5 Drag and Drop events in onDrop
                }}
              />
            </div>
          );
        })}
      </div>

      <ActivityDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={activeValues}
        title={dialogMode === "add" ? `Add Event to Day ${activeDay}` : "Edit Event"}
      />
    </div>
  );
}
