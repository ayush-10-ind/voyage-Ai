"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityCategory } from "../types";

const activitySchema = z.object({
  time: z.string().min(1, "Time is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  cost: z.string().min(1, "Cost is required"),
  category: z.enum(["sightseeing", "dining", "transit", "accommodation", "other"]),
  plannedCost: z.number().min(0),
  actualCost: z.number().min(0),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ActivityFormValues) => void;
  defaultValues?: {
    time: string;
    title: string;
    description: string;
    cost: string;
    category: ActivityCategory;
    plannedCost?: number;
    actualCost?: number;
  } | null;
  title: string;
}

export function ActivityDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title,
}: ActivityDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues || {
      time: "09:00 AM",
      title: "",
      description: "",
      cost: "Free",
      category: "sightseeing",
      plannedCost: 0,
      actualCost: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        defaultValues || {
          time: "09:00 AM",
          title: "",
          description: "",
          cost: "Free",
          category: "sightseeing",
          plannedCost: 0,
          actualCost: 0,
        }
      );
      // Autofocus the title field
      setTimeout(() => setFocus("title"), 50);
    }
  }, [isOpen, defaultValues, reset, setFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-glow max-w-sm text-left">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Time</label>
              <Input
                type="text"
                placeholder="e.g., 10:00 AM"
                className="bg-white/5 border-white/10 focus:border-primary/50 text-xs"
                {...register("time")}
              />
              {errors.time && (
                <p className="text-[10px] text-red-400">{errors.time.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Cost Label</label>
              <Input
                type="text"
                placeholder="e.g., Free, $25"
                className="bg-white/5 border-white/10 focus:border-primary/50 text-xs"
                {...register("cost")}
              />
              {errors.cost && (
                <p className="text-[10px] text-red-400">{errors.cost.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Planned ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-white/5 border-white/10 focus:border-primary/50 text-xs"
                {...register("plannedCost", { valueAsNumber: true })}
              />
              {errors.plannedCost && (
                <p className="text-[10px] text-red-400">{errors.plannedCost.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Actual ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-white/5 border-white/10 focus:border-primary/50 text-xs"
                {...register("actualCost", { valueAsNumber: true })}
              />
              {errors.actualCost && (
                <p className="text-[10px] text-red-400">{errors.actualCost.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Category</label>
            <select
              className="w-full bg-white/5 border border-white/10 text-xs rounded-xl p-2 text-white focus:outline-none focus:border-primary/50"
              {...register("category")}
            >
              <option value="sightseeing" className="bg-background text-foreground">Sightseeing</option>
              <option value="dining" className="bg-background text-foreground">Dining</option>
              <option value="transit" className="bg-background text-foreground">Transit</option>
              <option value="accommodation" className="bg-background text-foreground">Accommodation</option>
              <option value="other" className="bg-background text-foreground">Other</option>
            </select>
            {errors.category && (
              <p className="text-[10px] text-red-400">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Activity Title</label>
            <Input
              type="text"
              placeholder="e.g., Visit Meiji Shrine"
              className="bg-white/5 border-white/10 focus:border-primary/50 text-xs"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-[10px] text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Description</label>
            <Textarea
              placeholder="Provide details about the activity..."
              className="bg-white/5 border-white/10 focus:border-primary/50 text-xs min-h-[80px]"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] text-red-400">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
