export interface PaletteCommand {
  id: string;
  name: string;
  category: "Navigation" | "Finance" | "Timeline" | "AI";
  shortcut?: string;
  action: () => void;
}

class CommandPaletteService {
  private commands: Map<string, PaletteCommand> = new Map();

  /**
   * Registers a command.
   */
  register(command: PaletteCommand): () => void {
    this.commands.set(command.id, command);
    return () => this.commands.delete(command.id);
  }

  /**
   * Retrieves all registered commands.
   */
  getCommands(): PaletteCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Triggers a command by ID.
   */
  trigger(id: string): void {
    const command = this.commands.get(id);
    if (command) {
      command.action();
    } else {
      console.warn(`Command with ID ${id} is not registered.`);
    }
  }
}

export const CommandPalette = new CommandPaletteService();
