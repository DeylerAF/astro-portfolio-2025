export interface ButtonProps {
  text: string;
  icon?: unknown;
  iconPosition?: "left" | "right";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "spinButton" | "outlineButton";
  color?: "accent" | "default";
  url?: string;
  target?: string;
  rel?: string;
  /**
   * Size of the button: 'small', 'normal', or 'large'.
   * Default is 'normal'.
   */
  size?: "small" | "normal" | "large";
  /**
   * Enables responsive sizing based on viewport width.
   * When true, size will automatically adjust based on screen size.
   * This overrides the static size prop when viewport changes.
   */
  responsiveSize?: boolean;
  /**
   * Configuration for responsive sizing if custom breakpoints are needed.
   * Each property defines the size for that viewport range.
   */
  responsiveSizeConfig?: {
    mobile?: "small" | "normal" | "large";
    tablet?: "small" | "normal" | "large";
    desktop?: "small" | "normal" | "large";
    largeDesktop?: "small" | "normal" | "large";
  };
  [key: string]: unknown;
}

// Import utility functions from responsive.ts
import {
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
  isBrowser,
} from "./responsive";

/**
 * Client-side utility to initialize responsive button sizing.
 * This function adds event listeners to handle responsive button sizing based on screen width.
 * It should be called from a client-side script.
 */
export function initResponsiveButtonSizing() {
  // Only run in browser environment
  if (!isBrowser()) return;

  /**
   * Updates button sizes based on current viewport width
   */
  function updateButtonSizes() {
    const responsiveButtons = document.querySelectorAll(
      "[data-responsive-button]",
    );

    responsiveButtons.forEach((button) => {
      const configData = button.getAttribute("data-responsive-config");

      if (!configData) return;

      try {
        const config = JSON.parse(configData);
        const {
          mobile = "small",
          tablet = "normal",
          desktop = "normal",
          largeDesktop = "large",
        } = config;

        // Determine current size based on viewport width
        let currentSize;

        if (isMobile()) {
          currentSize = mobile;
        } else if (isTablet()) {
          currentSize = tablet;
        } else if (isDesktop()) {
          currentSize = desktop;
        } else if (isLargeDesktop()) {
          currentSize = largeDesktop;
        } else {
          currentSize = "normal"; // Default fallback
        }

        // Remove existing size classes
        button.classList.remove(
          "btn-size-small",
          "btn-size-normal",
          "btn-size-large",
        );

        // Add appropriate size class
        button.classList.add(`btn-size-${currentSize}`);
      } catch (error) {
        console.error(
          "Failed to parse responsive button configuration:",
          error,
        );
      }
    });
  }

  // Initialize on load
  updateButtonSizes();

  // Update on window resize
  window.addEventListener("resize", updateButtonSizes);
}

/**
 * Returns CSS variable values for the given button color.
 */
export function getButtonVars(color: string) {
  switch (color) {
    case "default":
      return {
        bg: "var(--button-default-bg)",
        text: "var(--button-default-text)",
        hoverBg: "var(--button-default-hover)",
      };
    case "accent":
    default:
      return {
        bg: "var(--button-accent-bg)",
        text: "var(--button-accent-text)",
        hoverBg: "var(--button-accent-hover)",
      };
  }
}

/**
 * Returns the outline class for the given color.
 */
export function getOutlineClass(color: string): string {
  switch (color) {
    case "default":
      return "btn-outline-default";
    case "accent":
    default:
      return "btn-outline-accent";
  }
}

/**
 * Determines if a URL is external.
 */
export function isExternalUrl(url?: string): boolean {
  return !!url && /^https?:\/\//.test(url);
}

/**
 * Returns the correct target and rel attributes for a link.
 */
export function getLinkAttrs(url?: string, target?: string, rel?: string) {
  const external = isExternalUrl(url);
  return {
    target: target || (external ? "_blank" : undefined),
    rel: rel || (external ? "noopener noreferrer" : undefined),
  };
}

/**
 * Returns the size class for the given button size.
 */
export function getButtonSizeClass(size: string = "normal"): string {
  switch (size) {
    case "small":
      return "btn-size-small";
    case "large":
      return "btn-size-large";
    case "normal":
    default:
      return "btn-size-normal";
  }
}

/**
 * Determines the appropriate button size based on the current viewport size.
 * @param responsiveSize Whether to use responsive sizing
 * @param staticSize The static size to use if responsiveSize is false
 * @param config Custom configuration for responsive sizes
 * @returns The appropriate button size for the current viewport
 */
export function getResponsiveButtonSize(
  responsiveSize: boolean = false,
  staticSize: string = "normal",
  config?: ButtonProps["responsiveSizeConfig"],
): string {
  // If responsive sizing is disabled, return the static size
  if (!responsiveSize) {
    return staticSize;
  }

  // Default responsive size configuration
  const defaultConfig = {
    mobile: "small",
    tablet: "normal",
    desktop: "normal",
    largeDesktop: "large",
  };

  // Merge default config with custom config if provided
  const mergedConfig = {
    ...defaultConfig,
    ...config,
  };

  // Determine the current device type and return the corresponding size
  if (isMobile()) {
    return mergedConfig.mobile || "small";
  } else if (isTablet()) {
    return mergedConfig.tablet || "normal";
  } else if (isDesktop()) {
    return mergedConfig.desktop || "normal";
  } else if (isLargeDesktop()) {
    return mergedConfig.largeDesktop || "large";
  }

  // Fallback to static size
  return staticSize;
}
