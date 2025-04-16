export interface ButtonProps {
  text: string;
  icon?: unknown;
  iconPosition?: "left" | "right";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "spinButton" | "outlineButton";
  color?: "primary" | "secondary" | "accent";
  // Remove gradient props, use CSS classes/variables instead
  url?: string;
  target?: string;
  rel?: string;
  [key: string]: unknown;
}

/**
 * Returns a conic-gradient CSS string for the animated border.
 * Accepts three color stops for both light and dark mode.
 */
export function getConicGradient(
  from: string,
  mid: string,
  to: string,
): string {
  return `conic-gradient(from 90deg at 50% 50%,${from} 0%,${mid} 50%,${to} 100%)`;
}

/**
 * Returns CSS variable values for the given button color.
 */
export function getButtonVars(color: string) {
  switch (color) {
    case "primary":
      return {
        bg: "var(--button-primary-bg)",
        text: "var(--button-primary-text)",
        hoverBg: "var(--button-primary-hover)",
      };
    case "secondary":
      return {
        bg: "var(--button-secondary-bg)",
        text: "var(--button-secondary-text)",
        hoverBg: "var(--button-secondary-hover)",
      };
    case "accent":
      return {
        bg: "var(--button-accent-bg)",
        text: "var(--button-accent-text)",
        hoverBg: "var(--button-accent-hover)",
      };
    default:
      return {
        bg: "var(--button-primary-bg)",
        text: "var(--button-primary-text)",
        hoverBg: "var(--button-primary-hover)",
      };
  }
}

/**
 * Returns the outline class for the given color.
 */
export function getOutlineClass(color: string): string {
  switch (color) {
    case "primary":
      return "btn-outline-primary";
    case "secondary":
      return "btn-outline-secondary";
    case "accent":
      return "btn-outline-accent";
    default:
      return "btn-outline-primary";
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
