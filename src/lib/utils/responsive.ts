/**
 * Utility functions for responsive design
 */

/**
 * Common breakpoints in pixels for responsive design
 */
export const breakpoints = {
  sm: 640, // Small devices (mobile)
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices (large desktops)
  xxl: 1536, // Extra extra large devices
};

/**
 * Check if the current viewport is a mobile viewport
 * @param breakpoint The breakpoint in pixels (default: 768px for md)
 * @returns Boolean indicating if viewport is mobile size
 */
export const isMobile = (breakpoint: number = breakpoints.md): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  return window.innerWidth < breakpoint;
};

/**
 * Check if the current viewport is a tablet viewport
 * @param minBreakpoint The minimum breakpoint in pixels (default: 768px for md)
 * @param maxBreakpoint The maximum breakpoint in pixels (default: 1024px for lg)
 * @returns Boolean indicating if viewport is tablet size
 */
export const isTablet = (
  minBreakpoint: number = breakpoints.md,
  maxBreakpoint: number = breakpoints.lg,
): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth >= minBreakpoint && window.innerWidth < maxBreakpoint
  );
};

/**
 * Check if the current viewport is a desktop viewport
 * @param minBreakpoint The minimum breakpoint in pixels (default: 1024px for lg)
 * @param maxBreakpoint The maximum breakpoint in pixels (default: 1280px for xl)
 * @returns Boolean indicating if viewport is desktop size
 */
export const isDesktop = (
  minBreakpoint: number = breakpoints.lg,
  maxBreakpoint: number = breakpoints.xl,
): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth >= minBreakpoint && window.innerWidth < maxBreakpoint
  );
};

/**
 * Check if the current viewport is a large desktop viewport
 * @param breakpoint The breakpoint in pixels (default: 1280px for xl)
 * @returns Boolean indicating if viewport is large desktop size
 */
export const isLargeDesktop = (
  breakpoint: number = breakpoints.xl,
): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  return window.innerWidth >= breakpoint;
};

/**
 * Check if the current viewport is within a specific range
 * @param minWidth The minimum width in pixels
 * @param maxWidth The maximum width in pixels (optional)
 * @returns Boolean indicating if viewport is within the specified range
 */
export const isWithinRange = (minWidth: number, maxWidth?: number): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  if (maxWidth === undefined) {
    return window.innerWidth >= minWidth;
  }

  return window.innerWidth >= minWidth && window.innerWidth < maxWidth;
};

/**
 * Get the current viewport width
 * @returns The current viewport width or 0 if in SSR environment
 */
export const getViewportWidth = (): number => {
  if (typeof window === "undefined") return 0;

  return window.innerWidth;
};

/**
 * Get the current viewport height
 * @returns The current viewport height or 0 if in SSR environment
 */
export const getViewportHeight = (): number => {
  if (typeof window === "undefined") return 0;

  return window.innerHeight;
};
