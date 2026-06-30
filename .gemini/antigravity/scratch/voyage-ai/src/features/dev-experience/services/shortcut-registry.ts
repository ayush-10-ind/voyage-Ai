export interface KeyboardShortcut {
  keys: string; // e.g., "Ctrl+Z", "Escape", "Delete"
  description: string;
  category: "Timeline" | "History" | "General";
  action: () => void;
}

class KeyboardShortcutRegistry {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  /**
   * Registers a new keyboard shortcut.
   */
  register(id: string, shortcut: KeyboardShortcut): () => void {
    this.shortcuts.set(id, shortcut);
    return () => this.shortcuts.delete(id);
  }

  /**
   * Get all registered shortcuts.
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Helper to format shortcut keys for display.
   */
  static formatKeys(keys: string): string {
    return keys
      .split("+")
      .map((key) => {
        if (key === "meta" || key === "ctrl") return "⌘";
        if (key === "shift") return "⇧";
        if (key === "alt") return "⌥";
        return key.toUpperCase();
      })
      .join(" ");
  }
}

export const ShortcutRegistry = new KeyboardShortcutRegistry();
