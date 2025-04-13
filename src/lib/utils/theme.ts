// Define theme types
export type ThemeType = "light" | "dark" | "system";

/**
 * Gets the user's theme preference from local storage or system
 * @returns The current theme preference: 'light', 'dark', or 'system'
 */
export const getThemePreference = (): ThemeType => {
  if (typeof localStorage === "undefined") return "system";

  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    return theme as ThemeType;
  }
  // Default to system preference
  return "system";
};

/**
 * Checks if the system prefers dark mode
 * @returns True if the system prefers dark mode
 */
export const systemPrefersDark = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Applies the theme to the document
 * @param theme The theme to apply: 'light', 'dark', or 'system'
 */
export const applyTheme = (theme: ThemeType): void => {
  // Remove all theme classes
  document.documentElement.classList.remove("light", "dark");

  // If system theme
  if (theme === "system") {
    localStorage.removeItem("theme");
    document.documentElement.classList.add(
      systemPrefersDark() ? "dark" : "light",
    );
  } else {
    // For explicit themes
    localStorage.setItem("theme", theme);
    document.documentElement.classList.add(theme);
  }
};

/**
 * Initialize theme on page load to prevent flash of incorrect theme
 * This can be used in a script tag with is:inline in the head
 */
export const initializeTheme = (): void => {
  const themeValue = getThemePreference();
  const isDark =
    themeValue === "dark" || (themeValue === "system" && systemPrefersDark());

  document.documentElement.classList.add(isDark ? "dark" : "light");
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
