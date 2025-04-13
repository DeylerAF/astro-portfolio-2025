// Define theme types
export type ThemeType = "light" | "dark" | "system";

/**
 * Gets the user's theme preference from local storage or system
 * @returns The current theme preference: 'light', 'dark', or 'system'
 */
export const getThemePreference = (): ThemeType => {
  if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
    const theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      return theme as ThemeType;
    }
  }
  // Default to system preference
  return "system";
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

    // Apply theme based on system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  } else {
    // For explicit themes
    localStorage.setItem("theme", theme);
    document.documentElement.classList.add(theme);
  }
};

/**
 * Initialize theme on page load to prevent flash of incorrect theme
 */
export const initializeTheme = (): void => {
  const themeValue = getThemePreference();

  // Apply theme immediately to prevent flash
  if (
    themeValue === "dark" ||
    (themeValue === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.add("light");
  }
};

// Setup listener for system preference changes
export const setupThemeListener = (): void => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getThemePreference() === "system") {
        applyTheme("system");
      }
    });
};
