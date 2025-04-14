/**
 * Theme management utilities
 */

export type ThemeType = "light" | "dark" | "system";

// Constants to avoid magic strings
const THEME_STORAGE_KEY = "theme";
const THEME_CLASSES = {
  light: "light",
  dark: "dark",
};
const THEME_ACCENT_CLASS = "text-[var(--accent-color)]";

/**
 * Gets the user's theme preference from local storage or system
 * @returns The current theme preference
 */
export const getThemePreference = (): ThemeType => {
  if (typeof localStorage === "undefined") return "system";

  const theme = localStorage.getItem(THEME_STORAGE_KEY);
  return theme === "light" || theme === "dark"
    ? (theme as ThemeType)
    : "system";
};

/**
 * Checks if the system prefers dark mode
 * @returns True if the system prefers dark mode
 */
export const systemPrefersDark = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Returns the actual theme to apply (resolves system preference)
 * @param theme The theme setting (light, dark, or system)
 * @returns The concrete theme (light or dark)
 */
export const resolveTheme = (theme: ThemeType): "light" | "dark" => {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
};

/**
 * Applies the theme to the document
 * @param theme The theme to apply
 */
export const applyTheme = (theme: ThemeType): void => {
  // Remove all theme classes
  document.documentElement.classList.remove(...Object.values(THEME_CLASSES));

  // Store preference and apply theme
  if (theme === "system") {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.add(resolveTheme(theme));
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.classList.add(theme);
  }
};

/**
 * Initialize theme on page load
 */
export const initializeTheme = (): void => {
  applyTheme(getThemePreference());
};

/**
 * Returns a self-contained script for inline HTML head use
 * Uses the same logic as the main utilities but in a self-executing function
 */
export const getInlineThemeScript = (): string => {
  return `
    (function() {
      const THEME_STORAGE_KEY = "theme";
      
      const getThemePreference = () => {
        if (typeof localStorage === "undefined") return "system";
        const theme = localStorage.getItem(THEME_STORAGE_KEY);
        return (theme === "light" || theme === "dark") ? theme : "system";
      };
      
      const systemPrefersDark = () => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      };
      
      const resolveTheme = (theme) => {
        return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
      };
      
      const theme = getThemePreference();
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolveTheme(theme));
    })();
  `;
};

/**
 * Setup listener for system preference changes
 */
export const setupThemeListener = (): void => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
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
    if (element) {
      if (key === theme) {
        element.classList.add(THEME_ACCENT_CLASS);
      } else {
        element.classList.remove(THEME_ACCENT_CLASS);
      }
    }
  });
};
