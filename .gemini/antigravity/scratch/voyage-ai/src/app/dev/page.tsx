"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Divider } from "@/components/ui/misc-primitives";

// Centralized Dev Registries
import { ShortcutRegistry } from "@/features/dev-experience/services/shortcut-registry";
import { CommandPalette } from "@/features/dev-experience/services/command-palette-service";
import { ThemeEngine } from "@/features/dev-experience/services/theme-engine";
import { FeedbackSystem, FeedbackItem } from "@/features/dev-experience/services/feedback-system";
import { useTimelineStore } from "@/features/timeline/store/use-timeline-store";
import { SimulationEngine } from "@/features/finance/domain/simulation-engine";

// Centralized Motion Presets
import { fadeIn, scaleUp, slideIn, hoverLift } from "@/lib/motion";

export default function DevPlaygroundPage() {
  // 1. Safety Check: Deny access in production
  // Note: NODE_ENV check is evaluated at build/runtime.
  // In Next.js, we can check process.env.NODE_ENV.
  const isProd = process.env.NODE_ENV === "production";
  
  if (isProd) {
    notFound();
  }

  const { trip, undo, redo, selectActivity } = useTimelineStore();
  
  // Local UI State
  const [activePanel, setActivePanel] = useState<"design" | "motion" | "engineering" | "simulator">("design");
  const [motionTrigger, setMotionTrigger] = useState(0);
  const [activeMotionVariant, setActiveMotionVariant] = useState<"fade" | "scale" | "slide">("fade");
  
  // Feedback Form State
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature_request" | "general">("general");
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  
  // Simulator State
  const [simResult, setSimResult] = useState<any>(null);

  // Register some sample palette commands & shortcuts for DX demonstration
  useEffect(() => {
    const unsubShortcuts = [
      ShortcutRegistry.register("undo", { keys: "Ctrl+Z", description: "Undo last timeline action", category: "History", action: undo }),
      ShortcutRegistry.register("redo", { keys: "Ctrl+Y", description: "Redo last timeline action", category: "History", action: redo }),
      ShortcutRegistry.register("deselect", { keys: "Escape", description: "Deselect active card", category: "Timeline", action: () => selectActivity(null) }),
    ];

    const unsubCommands = [
      CommandPalette.register({ id: "nav-finance", name: "Switch to Finance Tab", category: "Navigation", shortcut: "F", action: () => console.log("Command: Navigate to Finance") }),
      CommandPalette.register({ id: "ai-optimize", name: "Trigger AI Route Optimization", category: "AI", shortcut: "O", action: () => console.log("Command: Trigger AI Route Optimization") }),
    ];

    setFeedbackList(FeedbackSystem.getFeedback());

    return () => {
      unsubShortcuts.forEach((unsub) => unsub());
      unsubCommands.forEach((unsub) => unsub());
    };
  }, [undo, redo, selectActivity]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;
    FeedbackSystem.submitFeedback(feedbackType, feedbackText);
    setFeedbackText("");
    setFeedbackList([...FeedbackSystem.getFeedback()]);
  };

  const runSimulation = (type: "reduce_budget" | "increase_duration" | "upgrade_hotels") => {
    if (!trip) return;
    const result = SimulationEngine.simulate(trip, {
      type,
      params: type === "reduce_budget" ? { reductionAmount: 300 } : type === "increase_duration" ? { additionalDays: 2 } : {},
    });
    setSimResult(result);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8 space-y-8 flex flex-col items-center">
      {/* Dev Header */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Icons.settings className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <Typography variant="title" className="text-xl font-black font-heading tracking-tight">
              Voyage AI Dev-Suite
            </Typography>
            <Typography variant="caption" className="text-xs text-muted-foreground">
              Internal engineering dashboard and design tokens playground.
            </Typography>
          </div>
        </div>
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
          {(["design", "motion", "engineering", "simulator"] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activePanel === panel
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {panel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="w-full max-w-5xl">
        {activePanel === "design" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Design Tokens: Colors */}
            <GlassCard className="text-left space-y-4 border-glow">
              <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                Color Palette Tokens
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#050816] border border-white/10" />
                  <div>
                    <p className="text-xs font-bold">Deep Space Black</p>
                    <p className="text-[10px] text-muted-foreground">#050816</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary" />
                  <div>
                    <p className="text-xs font-bold">Primary Accent</p>
                    <p className="text-[10px] text-muted-foreground">#5B8CFF</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary" />
                  <div>
                    <p className="text-xs font-bold">Secondary Accent</p>
                    <p className="text-[10px] text-muted-foreground">#8B5CF6</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold">Success/Emerald</p>
                    <p className="text-[10px] text-muted-foreground">#10B981</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Glass Cards Showcase */}
            <div className="space-y-4">
              <GlassCard variant="hoverLift" className="text-left">
                <p className="text-xs font-bold text-white">GlassCard: Hover Lift</p>
                <p className="text-[10px] text-muted-foreground mt-1">Slight Y translation and scale on hover.</p>
              </GlassCard>
              <GlassCard variant="glowPrimary" className="text-left">
                <p className="text-xs font-bold text-primary">GlassCard: Glow Primary</p>
                <p className="text-[10px] text-muted-foreground mt-1">Primary accent border glow.</p>
              </GlassCard>
              <GlassCard variant="muffled" className="text-left">
                <p className="text-xs font-bold text-white">GlassCard: Muffled Blur</p>
                <p className="text-[10px] text-muted-foreground mt-1">High backdrop blur and low opacity.</p>
              </GlassCard>
            </div>
          </div>
        )}

        {activePanel === "motion" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <GlassCard className="text-left space-y-4 md:col-span-1 border-glow">
              <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                Motion Variants
              </Typography>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setActiveMotionVariant("fade");
                    setMotionTrigger((t) => t + 1);
                  }}
                  variant={activeMotionVariant === "fade" ? "default" : "outline"}
                  className="w-full text-xs"
                >
                  Trigger Fade In
                </Button>
                <Button
                  onClick={() => {
                    setActiveMotionVariant("scale");
                    setMotionTrigger((t) => t + 1);
                  }}
                  variant={activeMotionVariant === "scale" ? "default" : "outline"}
                  className="w-full text-xs"
                >
                  Trigger Scale Up
                </Button>
                <Button
                  onClick={() => {
                    setActiveMotionVariant("slide");
                    setMotionTrigger((t) => t + 1);
                  }}
                  variant={activeMotionVariant === "slide" ? "default" : "outline"}
                  className="w-full text-xs"
                >
                  Trigger Slide Up
                </Button>
              </div>
            </GlassCard>

            {/* Sandbox Canvas */}
            <GlassCard className="md:col-span-2 flex items-center justify-center min-h-[250px] relative overflow-hidden">
              <motion.div
                key={motionTrigger}
                initial="hidden"
                animate="visible"
                variants={
                  activeMotionVariant === "fade"
                    ? fadeIn
                    : activeMotionVariant === "scale"
                    ? scaleUp
                    : slideIn("up", 30)
                }
                className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary shadow-glow flex items-center justify-center font-bold text-xs text-white"
              >
                Sandbox
              </motion.div>
            </GlassCard>
          </div>
        )}

        {activePanel === "engineering" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shortcuts & Command Palette registries */}
            <div className="space-y-6">
              <GlassCard className="text-left space-y-3 border-glow">
                <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                  Active Keyboard Shortcuts
                </Typography>
                <div className="space-y-2">
                  {ShortcutRegistry.getShortcuts().map((shortcut, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{shortcut.description}</span>
                      <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[10px] text-white">
                        {shortcut.keys}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="text-left space-y-3">
                <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                  Registered Commands
                </Typography>
                <div className="space-y-2">
                  {CommandPalette.getCommands().map((cmd, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{cmd.name}</span>
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase font-bold">
                        {cmd.category}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Global Feedback Logger */}
            <GlassCard className="text-left space-y-4">
              <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                Feedback & Diagnostics
              </Typography>
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as any)}
                    className="h-8 bg-white/5 border border-white/10 text-xs rounded-xl p-1.5 text-white"
                  >
                    <option value="bug" className="bg-background text-foreground">Bug</option>
                    <option value="feature_request" className="bg-background text-foreground">Feature Request</option>
                    <option value="general" className="bg-background text-foreground">General</option>
                  </select>
                </div>
                <Input
                  type="text"
                  placeholder="Enter diagnostic comment..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="bg-white/5 border-white/10 text-xs focus:border-primary/50"
                  required
                />
                <Button type="submit" size="sm" className="w-full text-xs">
                  Submit Log
                </Button>
              </form>

              {/* Feedback History */}
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                {feedbackList.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] flex justify-between items-center">
                    <span className="text-muted-foreground truncate max-w-[220px]">{item.comment}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ${
                      item.type === "bug"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : item.type === "feature_request"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-muted-foreground"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activePanel === "simulator" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <GlassCard className="text-left space-y-4 md:col-span-1 border-glow">
              <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                Scenario Simulations
              </Typography>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => runSimulation("reduce_budget")}
                  className="w-full text-xs"
                >
                  Simulate Budget Cut (-$300)
                </Button>
                <Button
                  onClick={() => runSimulation("increase_duration")}
                  className="w-full text-xs"
                >
                  Simulate Duration Extension (+2 days)
                </Button>
                <Button
                  onClick={() => runSimulation("upgrade_hotels")}
                  className="w-full text-xs"
                >
                  Simulate Hotel Upgrade
                </Button>
              </div>
            </GlassCard>

            {/* Results Console */}
            <GlassCard className="md:col-span-2 text-left p-5 space-y-4">
              <Typography variant="body" className="font-bold text-sm border-b border-white/5 pb-2">
                Simulation Console
              </Typography>
              {simResult ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Scenario</p>
                      <p className="text-sm font-black text-white">{simResult.scenarioType.replace("_", " ").toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Simulated Health</p>
                      <p className="text-sm font-black text-emerald-400">{simResult.simulatedMetrics.healthScore}%</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Financial Impact</p>
                    <p className="text-xs text-white bg-white/5 p-2.5 rounded-xl border border-white/5">{simResult.impactDescription}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Recommended Adjustments</p>
                    <div className="space-y-1.5">
                      {simResult.recommendedAdjustments.map((adj: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          <span>{adj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground/60 border border-dashed border-white/5 rounded-2xl">
                  Select a simulation scenario on the left to run calculations.
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
