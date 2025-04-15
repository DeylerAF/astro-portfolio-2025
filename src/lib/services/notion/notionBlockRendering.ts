import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ProcessedBlock, RichTextItem } from "../../types/notion";
import { processEmojiContent } from "./notionIcons";

/**
 * Process blocks for rendering in a hierarchical structure
 */
export function processBlocksForRendering(
  blocks: BlockObjectResponse[],
  parentId?: string,
  level: number = 0,
): ProcessedBlock[] {
  const processedBlocks: ProcessedBlock[] = [];
  const directChildren = blocks.filter((block) => {
    if (!parentId) {
      return (
        !block.parent ||
        block.parent.type === "page_id" ||
        block.parent.type === "workspace"
      );
    }
    return (
      block.parent &&
      block.parent.type === "block_id" &&
      block.parent.block_id === parentId
    );
  });
  directChildren.forEach((block) => {
    const processedBlock = processBlockContent(block, level);
    if (block.has_children) {
      const childBlocks = blocks.filter(
        (childBlock) =>
          childBlock.parent &&
          childBlock.parent.type === "block_id" &&
          childBlock.parent.block_id === block.id,
      );
      if (childBlocks.length > 0) {
        processedBlock.children = processBlocksForRendering(
          blocks,
          block.id,
          level + 1,
        );
      }
    }
    processedBlocks.push(processedBlock);
  });
  return processedBlocks;
}

/**
 * Process an individual block's content based on its type
 */
function processBlockContent(
  block: BlockObjectResponse,
  level: number = 0,
): ProcessedBlock {
  const baseProcessedBlock: ProcessedBlock = {
    id: block.id,
    type: block.type,
    content: null,
    hasChildren: block.has_children,
    level,
  };
  switch (block.type) {
    case "paragraph":
      baseProcessedBlock.content = processRichTextArray(
        block.paragraph.rich_text,
      );
      break;
    case "heading_1":
      baseProcessedBlock.content = processRichTextArray(
        block.heading_1.rich_text,
      );
      break;
    case "heading_2":
      baseProcessedBlock.content = processRichTextArray(
        block.heading_2.rich_text,
      );
      break;
    case "heading_3":
      baseProcessedBlock.content = processRichTextArray(
        block.heading_3.rich_text,
      );
      break;
    case "bulleted_list_item":
      baseProcessedBlock.content = processRichTextArray(
        block.bulleted_list_item.rich_text,
      );
      break;
    case "numbered_list_item":
      baseProcessedBlock.content = processRichTextArray(
        block.numbered_list_item.rich_text,
      );
      break;
    case "to_do":
      baseProcessedBlock.content = {
        text: processRichTextArray(block.to_do.rich_text),
        checked: block.to_do.checked,
      };
      break;
    case "toggle":
      baseProcessedBlock.content = processRichTextArray(block.toggle.rich_text);
      break;
    case "code":
      baseProcessedBlock.content = {
        text: processRichTextArray(block.code.rich_text),
        language: block.code.language,
      };
      break;
    case "quote":
      baseProcessedBlock.content = processRichTextArray(block.quote.rich_text);
      break;
    case "callout": {
      const emojiContent = processEmojiContent(block);
      baseProcessedBlock.content = {
        text: processRichTextArray(block.callout.rich_text),
        icon: block.callout.icon,
        emoji: emojiContent,
      };
      break;
    }
    case "divider":
      baseProcessedBlock.content = null;
      break;
    case "image":
      baseProcessedBlock.content = {
        url:
          block.image.type === "external"
            ? block.image.external.url
            : block.image.file.url,
        caption: block.image.caption
          ? processRichTextArray(block.image.caption)
          : "",
      };
      break;
    case "bookmark":
      baseProcessedBlock.content = {
        url: block.bookmark.url,
        caption: block.bookmark.caption
          ? processRichTextArray(block.bookmark.caption)
          : "",
      };
      break;
    case "child_page":
      baseProcessedBlock.content = {
        title: block.child_page.title,
      };
      break;
    case "child_database":
      baseProcessedBlock.content = {
        title: block.child_database.title,
      };
      break;
    default:
      if (block.type === "unsupported") {
        baseProcessedBlock.content = { message: "Unsupported block type" };
      } else {
        baseProcessedBlock.content = {
          message: `Unknown block type: ${block.type}`,
        };
      }
  }
  return baseProcessedBlock;
}

/**
 * Process an array of rich text objects
 */
function processRichTextArray(
  richTexts: {
    plain_text: string;
    href?: string | null;
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    type: string;
  }[],
): RichTextItem[] | string {
  if (!richTexts || !Array.isArray(richTexts) || richTexts.length === 0) {
    return "";
  }
  return richTexts.map((richText) => ({
    text: richText.plain_text,
    href: richText.href || null,
    annotations: richText.annotations,
    type: richText.type,
  })) as RichTextItem[];
}
