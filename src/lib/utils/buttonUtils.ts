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
  [key: string]: unknown;
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
