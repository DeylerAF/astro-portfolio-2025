/**
 * Utility functions for responsive design
 */

/**
 * Check if the current viewport is a mobile viewport
 * @param breakpoint The breakpoint in pixels (default: 768px for md)
 * @returns Boolean indicating if viewport is mobile size
 */
export const isMobile = (breakpoint: number = 768): boolean => {
  // In SSR environment, window is not defined
  if (typeof window === "undefined") return false;

  return window.innerWidth < breakpoint;
};
