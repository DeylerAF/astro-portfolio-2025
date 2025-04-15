import type {
  PageObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  NotionIcon,
  BlockObjectResponseWithIcon,
} from "../../types/notion";

/**
 * Extracts icon (emoji or image) from a Notion page or block
 * @param item - A Notion page or block object that might contain an icon
 * @returns The emoji character, image URL, or null if no icon exists
 */
export function extractIcon(
  item:
    | PageObjectResponse
    | BlockObjectResponseWithIcon
    | Record<string, unknown>,
): { type: string; value: string } | null {
  if (!item || !("icon" in item) || !item.icon) return null;
  const { icon } = item as { icon: NotionIcon };
  if (icon.type === "emoji" && "emoji" in icon) {
    return {
      type: "emoji",
      value: icon.emoji,
    };
  } else if (
    icon.type === "external" &&
    "external" in icon &&
    icon.external?.url
  ) {
    return {
      type: "image",
      value: icon.external.url,
    };
  } else if (icon.type === "file" && "file" in icon && icon.file?.url) {
    return {
      type: "image",
      value: icon.file.url,
    };
  } else if (
    icon.type === "custom_emoji" &&
    "custom_emoji" in icon &&
    (icon.custom_emoji?.url || icon.custom_emoji?.emoji)
  ) {
    return {
      type: "emoji",
      value: icon.custom_emoji.emoji || icon.custom_emoji.url || "",
    };
  }
  return null;
}

/**
 * Process emoji content in Notion blocks
 * @param block - A Notion block that might contain emoji
 * @returns Processed emoji or null if no emoji exists
 */
export function processEmojiContent(block: BlockObjectResponse): string | null {
  if (block.type === "callout" && block.callout.icon) {
    const icon = block.callout.icon;
    if (icon.type === "emoji") {
      return icon.emoji;
    }
  } else if (block.type === "embed" && block.embed?.url) {
    const url = block.embed.url;
    if (url.includes("emoji") || url.includes("emojipedia")) {
      return url;
    }
  }
  // Extract icon if it exists
  const blockWithIcon = block as unknown as BlockObjectResponseWithIcon;
  if ("icon" in blockWithIcon && blockWithIcon.icon) {
    const icon = extractIcon(blockWithIcon);
    return icon?.type === "emoji" ? icon.value : null;
  }
  return null;
}
