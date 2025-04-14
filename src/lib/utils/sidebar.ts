/**
 * Sidebar utility functions for managing sidebar state
 */
import { getViewportWidth, breakpoints } from "./responsive";

/**
 * Type definition for sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  isMobileView: boolean;
}

/**
 * CSS class mapping for sidebar states
 */
const SIDEBAR_CLASSES = {
  mobile: {
    open: "translate-x-0",
    closed: "-translate-x-full",
  },
  desktop: {
    sidebar: {
      open: "md:w-[16rem]",
      closed: "md:w-16",
    },
    content: {
      open: "md:ml-64",
      closed: "md:ml-16",
    },
  },
  text: "md:hidden", // Class to hide/show text elements
  overlay: "hidden", // Class to hide/show overlay
  activeIcon: "text-[var(--accent-color)]", // Class for active link icon
};

/**
 * Apply classes to elements based on sidebar state
 * @param elements - The DOM elements
 * @param isMobile - Whether it's mobile view
 * @param isOpen - Whether sidebar is open
 */
const applySidebarClasses = (
  elements: {
    sidebar: HTMLElement | null;
    content: HTMLElement | null;
    overlay: HTMLElement | null;
    spans: NodeListOf<HTMLElement> | null;
  },
  isMobile: boolean,
  isOpen: boolean,
): void => {
  const { sidebar, content, overlay, spans } = elements;

  if (!sidebar || !content) return;

  if (isMobile) {
    // Mobile view logic
    sidebar.classList.toggle(SIDEBAR_CLASSES.mobile.closed, !isOpen);
    sidebar.classList.toggle(SIDEBAR_CLASSES.mobile.open, isOpen);

    // Toggle overlay
    if (overlay) {
      overlay.classList.toggle(SIDEBAR_CLASSES.overlay, !isOpen);
    }
  } else {
    // Desktop view logic
    sidebar.classList.toggle(SIDEBAR_CLASSES.desktop.sidebar.closed, !isOpen);
    sidebar.classList.toggle(SIDEBAR_CLASSES.desktop.sidebar.open, isOpen);
    content.classList.toggle(SIDEBAR_CLASSES.desktop.content.closed, !isOpen);
    content.classList.toggle(SIDEBAR_CLASSES.desktop.content.open, isOpen);

    // Toggle text visibility in desktop mode
    if (spans) {
      spans.forEach((span) => {
        span.classList.toggle(SIDEBAR_CLASSES.text, !isOpen);
      });
    }
  }
};

/**
 * Toggle the sidebar state
 * @param sidebar - The sidebar element
 * @param content - The content element
 * @param isCurrentlyOpen - Whether the sidebar is currently open
 * @returns The new sidebar state
 */
export const toggleSidebar = (
  sidebar: HTMLElement | null,
  content: HTMLElement | null,
  isCurrentlyOpen: boolean,
): boolean => {
  const viewportWidth = getViewportWidth();
  const isMobileView = viewportWidth < breakpoints.md;
  const newIsOpen = !isCurrentlyOpen;
  const overlay = document.getElementById("sidebar-overlay");
  const spans = document.querySelectorAll<HTMLElement>("#sidebar span");

  applySidebarClasses(
    { sidebar, content, overlay, spans },
    isMobileView,
    newIsOpen,
  );

  return newIsOpen;
};

/**
 * Initialize the sidebar based on device type
 * @param sidebar - The sidebar element
 * @param content - The content element
 * @param layoutToggle - The optional layout toggle button element
 * @returns The initial sidebar state
 */
export const initializeSidebar = (
  sidebar: HTMLElement | null,
  content: HTMLElement | null,
  layoutToggle?: HTMLElement | null,
): SidebarState => {
  const viewportWidth = getViewportWidth();
  const isMobileView = viewportWidth < breakpoints.md;
  const isTabletView =
    viewportWidth >= breakpoints.md && viewportWidth < breakpoints.lg;

  // Default: closed on mobile and tablet, open on desktop
  const isOpen = !(isMobileView || isTabletView);

  if (!sidebar || !content) {
    return { isOpen, isMobileView };
  }

  // Reset all classes first
  sidebar.classList.remove(
    SIDEBAR_CLASSES.mobile.open,
    SIDEBAR_CLASSES.mobile.closed,
    SIDEBAR_CLASSES.desktop.sidebar.open,
    SIDEBAR_CLASSES.desktop.sidebar.closed,
  );

  content.classList.remove(
    SIDEBAR_CLASSES.desktop.content.open,
    SIDEBAR_CLASSES.desktop.content.closed,
  );

  const overlay = document.getElementById("sidebar-overlay");
  const spans = document.querySelectorAll<HTMLElement>("#sidebar span");

  // Apply proper classes based on state
  applySidebarClasses(
    { sidebar, content, overlay, spans },
    isMobileView,
    isOpen,
  );

  // Layout toggle visibility
  if (layoutToggle) {
    layoutToggle.classList.toggle(SIDEBAR_CLASSES.text, !isMobileView);
  }

  // Add appropriate ARIA attributes
  updateSidebarAccessibility(sidebar, isOpen);

  return { isOpen, isMobileView };
};

/**
 * Update ARIA attributes for better accessibility
 * @param sidebar The sidebar element
 * @param isOpen Whether the sidebar is open
 */
const updateSidebarAccessibility = (
  sidebar: HTMLElement | null,
  isOpen: boolean,
): void => {
  if (!sidebar) return;

  // Set appropriate ARIA attributes
  sidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");
};

/**
 * Update the sidebar toggle icons based on state
 * @param openIcon - The open icon element
 * @param closeIcon - The close icon element
 * @param state - The current sidebar state
 * @param layoutToggle - The optional layout toggle button
 */
export const updateSidebarIcons = (
  openIcon: HTMLElement | null,
  closeIcon: HTMLElement | null,
  state: SidebarState,
  layoutToggle?: HTMLElement | null,
): void => {
  if (!openIcon || !closeIcon) return;

  // Set icon visibility based on sidebar state
  openIcon.style.display = state.isOpen ? "none" : "block";
  closeIcon.style.display = state.isOpen ? "block" : "none";

  // Only handle layout toggle in mobile view
  if (layoutToggle && state.isMobileView) {
    layoutToggle.style.display = state.isOpen ? "none" : "block";
  }
};

/**
 * Handle clicks outside the sidebar to close it on mobile
 * @param event - The click event
 * @param state - The current sidebar state
 * @param sidebar - The sidebar element
 * @param content - The content element
 * @returns The updated sidebar state
 */
export const handleOutsideClick = (
  event: MouseEvent,
  state: SidebarState,
  sidebar: HTMLElement | null,
  content: HTMLElement | null,
): SidebarState => {
  // Only proceed if on mobile and sidebar is open
  if (!state.isMobileView || !state.isOpen || !sidebar) {
    return state;
  }

  // Check if click is outside sidebar
  const target = event.target as Node;
  if (sidebar.contains(target)) {
    return state;
  }

  // Toggle sidebar closed
  const newIsOpen = toggleSidebar(sidebar, content, true);
  return { ...state, isOpen: newIsOpen };
};
