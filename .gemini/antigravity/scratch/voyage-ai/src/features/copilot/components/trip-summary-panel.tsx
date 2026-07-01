"use client";

import React, { useState } from "react";
import { useCopilotStore } from "../store/use-copilot-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TripSummaryPanel() {
  const { preferences, currentStep, editAnswer, saveDraft, draftSaved } = useCopilotStore();
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const steps = [
    { label: "Destination", value: preferences.destination, key: "destination", icon: <Icons.destination className="h-4 w-4" /> },
    { label: "Duration", value: preferences.duration ? `${preferences.duration} Days` : undefined, key: "duration", icon: <Icons.calendar className="h-4 w-4" /> },
    { label: "Travel Style", value: preferences.style, key: "style", icon: <Icons.filter className="h-4 w-4" /> },
    { label: "Budget Level", value: preferences.budget, key: "budget", icon: <Icons.budget className="h-4 w-4" /> },
    { label: "Interests", value: preferences.interests?.join(", "), key: "interests", icon: <Icons.sparkles className="h-4 w-4" /> },
    { label: "Companions", value: preferences.companions, key: "companions", icon: <Icons.user className="h-4 w-4" /> },
  ];

  if (preferences.companions === "family" || preferences.companions === "friends") {
    steps.push({
      label: "Group Size",
      value: preferences.travelers ? `${preferences.travelers} Travelers` : undefined,
      key: "travelers",
      icon: <Icons.user className="h-4 w-4" />
    });
  }

  const handleStartEdit = (stepIdx: number, currentValue: string) => {
    setEditingStep(stepIdx);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (stepIdx: number) => {
    if (!editValue.trim()) return;
    editAnswer(stepIdx, editValue.trim());
    setEditingStep(null);
  };

  return (
    <GlassCard padding="md" className="w-full max-w-xs h-[650px] flex flex-col justify-between border-glow shadow-glass pointer-events-auto text-left">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <Typography variant="body" className="font-bold text-white text-base flex items-center gap-2">
            <Icons.explore className="h-5 w-5 text-primary" />
            Trip Summary
          </Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground">
            Building your custom travel model
          </Typography>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isAnswered = step.value !== undefined;
            const isEditing = editingStep === idx;

            return (
              <div
                key={step.label}
                className={`flex flex-col gap-1 p-2 rounded-xl border transition-all duration-300 ${
                  isAnswered
                    ? "bg-white/5 border-white/10"
                    : idx === currentStep
                      ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
                      : "bg-transparent border-transparent opacity-40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/80">
                  <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    {step.icon}
                    <span>{step.label}</span>
                  </div>
                  {isAnswered && !isEditing && (
                    <button
                      onClick={() => handleStartEdit(idx, step.value?.toString() || "")}
                      className="text-[10px] text-primary/80 hover:text-primary hover:underline font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-7 text-xs py-1 px-2 bg-black/40 border-white/10 text-white"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(idx)}
                      className="h-7 px-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px]"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStep(null)}
                      className="h-7 px-2 text-muted-foreground text-[10px]"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Typography
                    variant="body"
                    className={`text-sm mt-0.5 capitalize font-medium ${
                      isAnswered ? "text-white" : "text-muted-foreground/40 italic"
                    }`}
                  >
                    {step.value || "Awaiting answer..."}
                  </Typography>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Saving Options */}
      <div className="space-y-2">
        <Button
          onClick={saveDraft}
          variant="outline"
          className="w-full rounded-xl py-5 text-xs font-semibold glass hover:bg-white/10 flex items-center justify-center gap-2"
        >
          {draftSaved ? (
            <>
              <Icons.check className="h-4 w-4 text-emerald-400" />
              Draft Saved
            </>
          ) : (
            <>
              <Icons.lock className="h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
}
