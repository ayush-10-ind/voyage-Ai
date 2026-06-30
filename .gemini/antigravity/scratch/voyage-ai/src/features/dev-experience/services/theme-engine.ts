export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

class ThemeEngineService {
  private activeTheme: string = "space-dark";
  private themes: Map<string, ThemeConfig> = new Map([
    [
      "space-dark",
      {
        id: "space-dark",
        name: "Deep Space Dark",
        colors: {
          background: "#050816",
          primary: "#5B8CFF",
          secondary: "#8B5CF6",
          accent: "#10B981",
        },
      },
    ],
    [
      "neon-cyber",
      {
        id: "neon-cyber",
        name: "Neon Cyberpunk",
        colors: {
          background: "#0a0518",
          primary: "#ec4899",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
        },
      },
    ],
  ]);

  /**
   * Switches the active theme.
   */
  setTheme(themeId: string): void {
    if (this.themes.has(themeId)) {
      this.activeTheme = themeId;
      console.log(`Theme switched to: ${themeId}`);
      // Future: update CSS custom properties on document.documentElement
    }
  }

  /**
   * Gets the active theme config.
   */
  getActiveTheme(): ThemeConfig {
    return this.themes.get(this.activeTheme)!;
  }

  /**
   * Gets all available themes.
   */
  getThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }
}

export const ThemeEngine = new ThemeEngineService();
