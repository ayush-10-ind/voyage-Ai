"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCopilotStore } from "../store/use-copilot-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { Typography } from "@/components/ui/typography";
import { Chip } from "@/components/ui/misc-primitives";

export function CopilotChat() {
  const {
    messages,
    currentStep,
    isGenerating,
    isStreaming,
    streamingText,
    submitAnswer,
    editAnswer,
  } = useCopilotStore();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, isStreaming, streamingText]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGenerating || isStreaming) return;
    submitAnswer(inputVal.trim());
    setInputVal("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isGenerating || isStreaming) return;
    submitAnswer(suggestion);
  };

  return (
    <div className="flex flex-col h-[650px] w-full max-w-lg glass rounded-2xl overflow-hidden border-glow shadow-glass pointer-events-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/5 p-4 bg-white/5">
        <div className="flex items-center gap-2">
          <Icons.sparkles className="h-5 w-5 text-primary animate-pulse" />
          <div className="text-left">
            <Typography variant="body" className="font-bold text-white text-sm">
              Voyage AI Copilot
            </Typography>
            <Typography variant="caption" className="text-[10px] text-emerald-400">
              Online • Ready to assist
            </Typography>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs border ${
                    isUser 
                      ? "bg-secondary/20 border-secondary/30 text-secondary" 
                      : "bg-primary/20 border-primary/30 text-primary"
                  }`}>
                    {isUser ? <Icons.user className="h-4 w-4" /> : <Icons.sparkles className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <GlassCard
                      padding="sm"
                      className={`rounded-2xl text-left text-xs leading-relaxed ${
                        isUser
                          ? "bg-secondary/10 border-secondary/20 text-white rounded-tr-none"
                          : "bg-white/5 border-white/10 text-white rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </GlassCard>
                    <span className="text-[9px] text-muted-foreground/60 block text-right px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Real-time Streaming Thought bubble */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start"
            >
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs border bg-primary/20 border-primary/30 text-primary">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div>
                <div className="space-y-1">
                  <GlassCard
                    padding="sm"
                    className="bg-white/5 border-white/10 text-white rounded-2xl rounded-tl-none text-left text-xs leading-relaxed font-mono whitespace-pre-line"
                  >
                    {streamingText || "Crafting your bespoke itinerary..."}
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading Thinking Indicator */}
          {isGenerating && !isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-12 py-2"
            >
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div className="px-4 py-2 bg-black/30 border-t border-white/5">
        <AnimatePresence mode="wait">
          {!isGenerating && !isStreaming && messages[messages.length - 1]?.suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-wrap gap-1.5"
            >
              {messages[messages.length - 1].suggestions?.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSuggestionClick(sug)}
                  className="rounded-full bg-white/5 border border-white/10 hover:border-primary/40 px-3 py-1 text-[10px] font-semibold text-white transition-all hover:bg-white/10 active:scale-95 text-left"
                >
                  {sug}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
        <Input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isGenerating || isStreaming ? "Copilot is typing..." : "Type your answer or request..."}
          disabled={isGenerating || isStreaming}
          className="flex-1 py-4 bg-white/5 border-white/10 focus:border-primary/50 text-xs rounded-xl"
        />
        <Button
          type="submit"
          disabled={!inputVal.trim() || isGenerating || isStreaming}
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 p-0 flex items-center justify-center"
        >
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
