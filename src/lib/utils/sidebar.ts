/**
 * Sidebar utility functions for managing sidebar state
 */
import { isMobile } from "./responsive";

/**
 * Type definition for sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  isMobileView: boolean;
}

/**
 * CSS class mapping for different sidebar states
 */
const SIDEBAR_CLASSES = {
  mobile: {
    open: "translate-x-0",
    closed: "-translate-x-full",
  },
  desktop: {
    open: {
      sidebar: "md:w-[16rem]",
      content: "md:ml-64",
    },
    closed: {
      sidebar: "md:w-16",
      content: "md:ml-16",
    },
  },
  text: {
    visible: "block",
    hidden: "hidden",
  },
};

/**
 * Display states for elements
 */
const DISPLAY = {
  show: "block",
  hide: "none",
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
  if (!sidebar || !content) return isCurrentlyOpen;

  const isMobileView = isMobile();
  const newIsOpen = !isCurrentlyOpen;

  if (isMobileView) {
    // On mobile, control visibility with translate classes
    sidebar.classList.toggle(SIDEBAR_CLASSES.mobile.closed);
    sidebar.classList.toggle(SIDEBAR_CLASSES.mobile.open);
  } else {
    // On desktop, control width
    sidebar.classList.toggle(SIDEBAR_CLASSES.desktop.closed.sidebar);
    sidebar.classList.toggle(SIDEBAR_CLASSES.desktop.open.sidebar);
    content.classList.toggle(SIDEBAR_CLASSES.desktop.closed.content);
    content.classList.toggle(SIDEBAR_CLASSES.desktop.open.content);

    // Toggle text visibility
    document.querySelectorAll("#sidebar span").forEach((span) => {
      span.classList.toggle(SIDEBAR_CLASSES.text.hidden);
      span.classList.toggle(SIDEBAR_CLASSES.text.visible);
    });
  }

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
  const isMobileView = isMobile();
  const isOpen = !isMobileView; // Default: closed on mobile, open on desktop

  if (!sidebar || !content) {
    return { isOpen, isMobileView };
  }

  if (isMobileView) {
    // On mobile, initially hidden
    sidebar.classList.add(SIDEBAR_CLASSES.mobile.closed);
    sidebar.classList.remove(SIDEBAR_CLASSES.mobile.open);

    // Show layout toggle button on mobile
    if (layoutToggle) {
      layoutToggle.classList.remove(SIDEBAR_CLASSES.text.hidden);
    }
  } else {
    // On desktop, initially expanded
    sidebar.classList.remove(SIDEBAR_CLASSES.desktop.closed.sidebar);
    sidebar.classList.add(SIDEBAR_CLASSES.desktop.open.sidebar);
    content.classList.remove(SIDEBAR_CLASSES.desktop.closed.content);
    content.classList.add(SIDEBAR_CLASSES.desktop.open.content);

    // All texts visible initially on desktop
    document.querySelectorAll("#sidebar span").forEach((span) => {
      span.classList.remove(SIDEBAR_CLASSES.text.hidden);
      span.classList.add(SIDEBAR_CLASSES.text.visible);
    });

    // Hide layout toggle on desktop
    if (layoutToggle) {
      layoutToggle.classList.add(SIDEBAR_CLASSES.text.hidden);
    }
  }

  return { isOpen, isMobileView };
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
  openIcon.style.display = state.isOpen ? DISPLAY.hide : DISPLAY.show;
  closeIcon.style.display = state.isOpen ? DISPLAY.show : DISPLAY.hide;

  // Only handle layout toggle in mobile view
  if (layoutToggle && state.isMobileView) {
    layoutToggle.style.display = state.isOpen ? DISPLAY.hide : DISPLAY.show;
  }
};
