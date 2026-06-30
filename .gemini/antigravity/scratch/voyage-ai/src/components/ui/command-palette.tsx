"use client";

import React, { useState, useEffect, useRef } from "react";
import { CommandPalette as Registry } from "@/features/dev-experience/services/command-palette-service";
import { Icons } from "./icons";
import { Input } from "./input";
import { GlassCard } from "./glass-card";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
        setSearch("");
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      // Navigate options
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeCmd = filteredCommands[selectedIndex];
        if (activeCmd) {
          activeCmd.action();
          setIsOpen(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, search]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const commands = Registry.getCommands();
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        ref={containerRef}
        className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 shadow-glow bg-[#090d1f]/95 overflow-hidden animate-scale-up"
      >
        {/* Input Header */}
        <div className="relative flex items-center border-b border-white/5 p-3">
          <Icons.search className="absolute left-4 h-4.5 w-4.5 text-muted-foreground/50" />
          <Input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full pl-10 bg-transparent border-none text-sm text-white placeholder:text-muted-foreground/40 focus:ring-0 focus:outline-none h-9"
            autoFocus
          />
          <div className="absolute right-4 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-muted-foreground/60">
            ESC
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar space-y-0.5">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 border ${
                      isSelected 
                        ? "bg-white/10 border-white/10" 
                        : "bg-white/5 border-white/5"
                    }`}>
                      {cmd.category === "Navigation" ? <Icons.explore className="h-3.5 w-3.5" /> :
                       cmd.category === "Finance" ? <Icons.budget className="h-3.5 w-3.5" /> :
                       cmd.category === "AI" ? <Icons.sparkles className="h-3.5 w-3.5" /> : <Icons.settings className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-xs font-bold truncate">{cmd.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-white/10" : "bg-white/5 text-muted-foreground/60"
                    }`}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                        isSelected ? "bg-white/10 border-white/10" : "bg-white/5 border-white/5 text-muted-foreground/60"
                      }`}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground/40">
              No commands matched your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CommandPalette;
