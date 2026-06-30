"use client";

import * as React from "react";
import { Icons } from "./icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

export const SearchBar = React.forwardRef<HTMLButtonElement, SearchBarProps>(
  ({ className, placeholder = "Search trips, destinations...", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground/80 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg w-full max-w-sm transition-all duration-200 text-left cursor-pointer",
          className
        )}
        {...props}
      >
        <Icons.search className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1">{placeholder}</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }
);
SearchBar.displayName = "SearchBar";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem className="cursor-pointer flex items-center gap-2">
            <Icons.explore className="h-4 w-4 text-primary" />
            <span>Explore Destinations</span>
          </CommandItem>
          <CommandItem className="cursor-pointer flex items-center gap-2">
            <Icons.calendar className="h-4 w-4 text-primary" />
            <span>Create New Trip</span>
          </CommandItem>
          <CommandItem className="cursor-pointer flex items-center gap-2">
            <Icons.budget className="h-4 w-4 text-primary" />
            <span>Budget Planner</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem className="cursor-pointer flex items-center gap-2">
            <Icons.user className="h-4 w-4" />
            <span>Profile Settings</span>
          </CommandItem>
          <CommandItem className="cursor-pointer flex items-center gap-2">
            <Icons.settings className="h-4 w-4" />
            <span>Preferences</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
