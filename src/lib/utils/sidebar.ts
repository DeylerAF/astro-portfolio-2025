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
 * Toggle the sidebar state
 * @param sidebar - The sidebar element
 * @param content - The content element
 * @param isCurrentlyOpen - Whether the sidebar is currently open
 * @returns The new sidebar state
 */
export const toggleSidebar = (
  sidebar: HTMLElement,
  content: HTMLElement,
  isCurrentlyOpen: boolean,
): boolean => {
  const isMobileView = isMobile();
  const newIsOpen = !isCurrentlyOpen;

  if (isMobileView) {
    // On mobile, control visibility with translate classes
    sidebar.classList.toggle("-translate-x-full");
    sidebar.classList.toggle("translate-x-0");
  } else {
    // On desktop, control width
    sidebar.classList.toggle("md:w-16");
    sidebar.classList.toggle("md:w-[16rem]");
    content.classList.toggle("md:ml-16");
    content.classList.toggle("md:ml-64");

    // Toggle text visibility
    document.querySelectorAll("#sidebar span").forEach((span) => {
      span.classList.toggle("hidden");
      span.classList.toggle("block");
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
  sidebar: HTMLElement,
  content: HTMLElement,
  layoutToggle?: HTMLElement,
): SidebarState => {
  const isMobileView = isMobile();
  let isOpen = !isMobileView; // Default: closed on mobile, open on desktop

  if (isMobileView) {
    // On mobile, initially hidden
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");

    // Show layout toggle button on mobile
    if (layoutToggle) {
      layoutToggle.classList.remove("hidden");
    }
  } else {
    // On desktop, initially expanded
    sidebar.classList.remove("md:w-16");
    sidebar.classList.add("md:w-[16rem]");
    content.classList.remove("md:ml-16");
    content.classList.add("md:ml-64");

    // All texts visible initially on desktop
    document.querySelectorAll("#sidebar span").forEach((span) => {
      span.classList.remove("hidden");
      span.classList.add("block");
    });

    // Hide layout toggle on desktop
    if (layoutToggle) {
      layoutToggle.classList.add("hidden");
    }
  }

  return { isOpen, isMobileView };
};

/**
 * Update the sidebar toggle icons based on state
 * @param openIcon - The open icon element
 * @param closeIcon - The close icon element
 * @param layoutToggle - The optional layout toggle button
 * @param state - The current sidebar state
 */
export const updateSidebarIcons = (
  openIcon: HTMLElement,
  closeIcon: HTMLElement,
  state: SidebarState,
  layoutToggle?: HTMLElement,
): void => {
  if (state.isOpen) {
    openIcon.style.display = "none";
    closeIcon.style.display = "block";

    // Hide layout toggle when sidebar is open on mobile
    if (layoutToggle && state.isMobileView) {
      layoutToggle.style.display = "none";
    }
  } else {
    openIcon.style.display = "block";
    closeIcon.style.display = "none";

    // Show layout toggle when sidebar is closed on mobile
    if (layoutToggle && state.isMobileView) {
      layoutToggle.style.display = "block";
    }
  }
};
