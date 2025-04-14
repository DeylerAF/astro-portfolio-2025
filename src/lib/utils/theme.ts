/**
 * Theme management utilities
 */

// Define available theme types
export type ThemeType = "light" | "dark" | "system";
export type ConcreteTheme = Exclude<ThemeType, "system">;

// Constants to avoid magic strings
export const THEME_STORAGE_KEY = "theme";
export const THEME_CLASSES: Record<ConcreteTheme, string> = {
  light: "light",
  dark: "dark",
};
export const THEME_ACCENT_CLASS = "text-[var(--accent-color)]";

/**
 * Safely access browser APIs to avoid issues during SSR
 */
const browserAPI = {
  localStorage: {
    get: (key: string): string | null => {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem(key);
    },
    set: (key: string, value: string): void => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    },
    remove: (key: string): void => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    },
  },
  mediaQuery: {
    prefersDark: (): boolean => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    addChangeListener: (
      callback: (event: MediaQueryListEvent) => void,
    ): void => {
      if (typeof window !== "undefined") {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", callback);
      }
    },
  },
  dom: {
    updateClassList: (add: string[], remove: string[] = []): void => {
      if (typeof document === "undefined") return;
      if (remove.length) {
        document.documentElement.classList.remove(...remove);
      }
      if (add.length) {
        document.documentElement.classList.add(...add);
      }
    },
  },
};

/**
 * Gets the user's theme preference from local storage or system
 * @returns The current theme preference
 */
export const getThemePreference = (): ThemeType => {
  const theme = browserAPI.localStorage.get(THEME_STORAGE_KEY);
  return theme === "light" || theme === "dark"
    ? (theme as ThemeType)
    : "system";
};

/**
 * Checks if the system prefers dark mode
 * @returns True if the system prefers dark mode
 */
export const systemPrefersDark = (): boolean => {
  return browserAPI.mediaQuery.prefersDark();
};

/**
 * Returns the actual theme to apply (resolves system preference)
 * @param theme The theme setting (light, dark, or system)
 * @returns The concrete theme (light or dark)
 */
export const resolveTheme = (theme: ThemeType): ConcreteTheme => {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
};

/**
 * Applies the theme to the document
 * @param theme The theme to apply
 */
export const applyTheme = (theme: ThemeType): void => {
  // Remove all theme classes
  browserAPI.dom.updateClassList([], Object.values(THEME_CLASSES));

  // Determine the concrete theme to apply
  const concreteTheme = resolveTheme(theme);

  // Store preference and apply theme
  if (theme === "system") {
    browserAPI.localStorage.remove(THEME_STORAGE_KEY);
  } else {
    browserAPI.localStorage.set(THEME_STORAGE_KEY, theme);
  }

  // Apply the theme class
  browserAPI.dom.updateClassList([concreteTheme]);
};

/**
 * Initialize theme on page load
 */
export const initializeTheme = (): void => {
  applyTheme(getThemePreference());
};

/**
 * Setup listener for system preference changes
 */
export const setupThemeListener = (): void => {
  browserAPI.mediaQuery.addChangeListener(() => {
    if (getThemePreference() === "system") {
      applyTheme("system");
    }
  });
};

/**
 * Update button states to reflect the current theme
 * @param theme The active theme
 * @param themeToggles Element references for each theme button
 */
export const updateButtonState = (
  theme: ThemeType,
  themeToggles: Record<ThemeType, HTMLElement | null>,
): void => {
  Object.entries(themeToggles).forEach(([key, element]) => {
    if (!element) return;

    const isActive = key === theme;
    element.classList[isActive ? "add" : "remove"](THEME_ACCENT_CLASS);
  });
};
