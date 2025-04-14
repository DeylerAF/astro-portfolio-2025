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
 * Device type enumeration for clearer identification
 */
export enum DeviceType {
  Mobile = "mobile",
  Tablet = "tablet",
  Desktop = "desktop",
  LargeDesktop = "largeDesktop",
}

/**
 * Check if the code is running in a browser environment
 * @returns Boolean indicating if window is defined
 */
const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Safely get viewport width accounting for SSR
 * @returns The current viewport width or 0 if in SSR environment
 */
export const getViewportWidth = (): number =>
  isBrowser() ? window.innerWidth : 0;

/**
 * Safely get viewport height accounting for SSR
 * @returns The current viewport height or 0 if in SSR environment
 */
export const getViewportHeight = (): number =>
  isBrowser() ? window.innerHeight : 0;

/**
 * Core function to check if viewport width is within a specific range
 * @param minWidth The minimum width in pixels
 * @param maxWidth The maximum width in pixels (optional)
 * @returns Boolean indicating if viewport is within the specified range
 */
export const isWithinRange = (minWidth: number, maxWidth?: number): boolean => {
  if (!isBrowser()) return false;

  const width = getViewportWidth();
  return maxWidth === undefined
    ? width >= minWidth
    : width >= minWidth && width < maxWidth;
};

/**
 * Check if the current viewport is a mobile viewport
 * @param breakpoint The breakpoint in pixels (default: 768px for md)
 * @returns Boolean indicating if viewport is mobile size
 */
export const isMobile = (breakpoint: number = breakpoints.md): boolean =>
  isWithinRange(0, breakpoint);

/**
 * Check if the current viewport is a tablet viewport
 * @param minBreakpoint The minimum breakpoint in pixels (default: 768px for md)
 * @param maxBreakpoint The maximum breakpoint in pixels (default: 1024px for lg)
 * @returns Boolean indicating if viewport is tablet size
 */
export const isTablet = (
  minBreakpoint: number = breakpoints.md,
  maxBreakpoint: number = breakpoints.lg,
): boolean => isWithinRange(minBreakpoint, maxBreakpoint);

/**
 * Check if the current viewport is a desktop viewport
 * @param minBreakpoint The minimum breakpoint in pixels (default: 1024px for lg)
 * @param maxBreakpoint The maximum breakpoint in pixels (default: 1280px for xl)
 * @returns Boolean indicating if viewport is desktop size
 */
export const isDesktop = (
  minBreakpoint: number = breakpoints.lg,
  maxBreakpoint: number = breakpoints.xl,
): boolean => isWithinRange(minBreakpoint, maxBreakpoint);

/**
 * Check if the current viewport is a large desktop viewport
 * @param breakpoint The breakpoint in pixels (default: 1280px for xl)
 * @returns Boolean indicating if viewport is large desktop size
 */
export const isLargeDesktop = (breakpoint: number = breakpoints.xl): boolean =>
  isWithinRange(breakpoint);

/**
 * Get the current device type based on viewport width
 * @returns The current device type as defined in DeviceType enum
 */
export const getDeviceType = (): DeviceType => {
  if (isMobile()) return DeviceType.Mobile;
  if (isTablet()) return DeviceType.Tablet;
  if (isDesktop()) return DeviceType.Desktop;
  return DeviceType.LargeDesktop;
};

/**
 * Check if the current viewport is in landscape orientation
 * @returns Boolean indicating if viewport is in landscape orientation
 */
export const isLandscape = (): boolean => {
  if (!isBrowser()) return false;

  return window.innerWidth > window.innerHeight;
};

/**
 * Check if the current viewport is in portrait orientation
 * @returns Boolean indicating if viewport is in portrait orientation
 */
export const isPortrait = (): boolean => {
  if (!isBrowser()) return false;

  return window.innerWidth <= window.innerHeight;
};

/**
 * Get the current aspect ratio of the viewport
 * @returns The aspect ratio as width/height or 0 if in SSR environment
 */
export const getAspectRatio = (): number => {
  if (!isBrowser()) return 0;

  return window.innerWidth / window.innerHeight;
};

/**
 * Create a media query string for use with CSS-in-JS libraries
 * @param minWidth The minimum width in pixels (optional)
 * @param maxWidth The maximum width in pixels (optional)
 * @returns A media query string
 */
export const createMediaQuery = (
  minWidth?: number,
  maxWidth?: number,
): string => {
  let query = "";

  if (minWidth !== undefined) {
    query += `(min-width: ${minWidth}px)`;
  }

  if (minWidth !== undefined && maxWidth !== undefined) {
    query += " and ";
  }

  if (maxWidth !== undefined) {
    query += `(max-width: ${maxWidth}px)`;
  }

  return query ? `@media ${query}` : "";
};
