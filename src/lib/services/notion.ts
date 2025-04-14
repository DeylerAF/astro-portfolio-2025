import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  NotionProperty,
  NotionTitleProperty,
  NotionRichTextProperty,
  NotionUrlProperty,
  NotionDateProperty,
  NotionMultiSelectProperty,
  NotionSelectProperty,
  NotionFilesProperty,
  ProcessedBlock,
  RichTextItem,
} from "../types/notion";

// ===== Notion Client Module =====

/**
 * Singleton Notion client to centralize API access
 */
class NotionClient {
  private static instance: NotionClient;
  private client: Client;

  private constructor() {
    this.client = new Client({
      auth: import.meta.env.PUBLIC_NOTION_TOKEN,
    });
  }

  static getInstance(): NotionClient {
    if (!NotionClient.instance) {
      NotionClient.instance = new NotionClient();
    }
    return NotionClient.instance;
  }

  getClient(): Client {
    return this.client;
  }
}

// Get the Notion client instance
const notionClient = NotionClient.getInstance().getClient();

// ===== Type Guards =====

/**
 * Type guard to check if a block is a BlockObjectResponse
 */
function isBlockObjectResponse(block: unknown): block is BlockObjectResponse {
  return typeof block === "object" && block !== null && "type" in block;
}

/**
 * Type guard to check if a block has children
 */
function hasChildren(block: BlockObjectResponse): boolean {
  return "has_children" in block && block.has_children === true;
}

/**
 * Type guard to check if a string is an image URL
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const imageDomains = ["images.unsplash.com", "secure.notion-static.com"];

  return (
    imageExtensions.some((ext) => url.endsWith(ext)) ||
    imageDomains.some((domain) => url.includes(domain))
  );
}

// ===== Error Handling =====

/**
 * Standardized error handler for Notion API calls
 * @param operation - Description of the operation that failed
 * @param error - The error that occurred
 * @param defaultValue - The default value to return on error
 */
function handleNotionError<T>(
  operation: string,
  error: unknown,
  defaultValue: T,
): T {
  console.error(`Error ${operation}:`, error);
  return defaultValue;
}

// ===== Product API =====

/**
 * Fetches all products from the Notion database
 * @returns Array of products from Notion
 */
export async function getProducts() {
  try {
    const response = await notionClient.databases.query({
      database_id: import.meta.env.PUBLIC_NOTION_DATABASE_ID,
    });

    return response.results;
  } catch (error) {
    return handleNotionError("fetching products from Notion", error, []);
  }
}

/**
 * Fetches a single product by its ID
 * @param pageId - The Notion page ID of the product
 * @returns Product data or null if not found
 */
export async function getProductById(
  pageId: string,
): Promise<PageObjectResponse | null> {
  try {
    const response = await notionClient.pages.retrieve({
      page_id: pageId,
    });

    return response as PageObjectResponse;
  } catch (error) {
    return handleNotionError(`fetching product with ID ${pageId}`, error, null);
  }
}

// ===== Block API =====

/**
 * Fetches all block children of a specific block or page
 * @param blockId - The Notion block or page ID
 * @param startCursor - Pagination cursor
 * @param pageSize - Number of blocks to fetch per request
 * @returns Response containing block children
 */
export async function getBlockChildren(
  blockId: string,
  startCursor?: string,
  pageSize: number = 100,
): Promise<ListBlockChildrenResponse> {
  try {
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    return response;
  } catch (error) {
    return handleNotionError(`fetching block children for ${blockId}`, error, {
      object: "list",
      type: "block",
      block: {},
      results: [],
      has_more: false,
      next_cursor: null,
    });
  }
}

/**
 * Recursively fetches all blocks (including nested blocks) of a Notion page
 * @param blockId - The Notion block or page ID
 * @returns Array of all blocks, including nested ones
 */
export async function getAllBlocksRecursively(
  blockId: string,
): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let startCursor: string | undefined = undefined;
  let hasMore = true;

  // Fetch all top-level blocks
  while (hasMore) {
    const response = await getBlockChildren(blockId, startCursor);
    // Filter blocks to ensure they're BlockObjectResponse objects
    const blockResults = response.results.filter(isBlockObjectResponse);
    blocks.push(...blockResults);

    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  // Process blocks with children recursively
  const blocksWithChildren = await processBlocksWithChildren(blocks);
  return blocksWithChildren;
}

/**
 * Process blocks to fetch their children recursively
 */
async function processBlocksWithChildren(
  blocks: BlockObjectResponse[],
): Promise<BlockObjectResponse[]> {
  const blocksWithChildren: BlockObjectResponse[] = [];

  for (const block of blocks) {
    blocksWithChildren.push(block);

    if (hasChildren(block)) {
      const childBlocks = await getAllBlocksRecursively(block.id);
      blocksWithChildren.push(...childBlocks);
    }
  }

  return blocksWithChildren;
}

// ===== Image Processing =====

/**
 * Extracts all image blocks from an array of Notion blocks
 * @param blocks - Array of Notion blocks
 * @returns Array of image URLs
 */
export function extractImagesFromBlocks(
  blocks: BlockObjectResponse[],
): string[] {
  return blocks
    .filter((block) => block.type === "image")
    .map((block) => {
      const imageBlock = block.image;
      return imageBlock.type === "external"
        ? imageBlock.external.url
        : imageBlock.type === "file"
          ? imageBlock.file.url
          : "";
    })
    .filter((url) => url !== "");
}

/**
 * Extracts cover image URL from a Notion page if it exists
 */
function extractCoverImage(page: PageObjectResponse): string | null {
  if (!("cover" in page) || !page.cover) return null;

  return page.cover.type === "external"
    ? page.cover.external.url
    : page.cover.type === "file"
      ? page.cover.file.url
      : null;
}

/**
 * Extracts image URLs from property values
 */
function extractImagesFromProperties(
  properties: Record<string, unknown>,
): string[] {
  const imageUrls: string[] = [];

  Object.values(properties).forEach((value) => {
    if (Array.isArray(value)) {
      value
        .filter((item) => typeof item === "string" && isImageUrl(item))
        .forEach((url) => imageUrls.push(url as string));
    }
  });

  return imageUrls;
}

/**
 * Fetches all images from a Notion page, including both property images and block images
 * @param pageId - The Notion page ID
 * @returns Object containing property images and block images
 */
export async function getImagesFromPage(pageId: string): Promise<{
  propertyImages: string[];
  blockImages: string[];
  allImages: string[];
}> {
  try {
    // Get the page to extract property images
    const page = await getProductById(pageId);
    const propertyImages: string[] = [];

    if (page) {
      // Extract images from properties
      const parsedProperties = parseNotionProperties(page.properties);

      // Add cover image if it exists
      const coverImage = extractCoverImage(page);
      if (coverImage) {
        propertyImages.push(coverImage);
      }

      // Add images from properties
      const propertyImageUrls = extractImagesFromProperties(parsedProperties);
      propertyImages.push(...propertyImageUrls);
    }

    // Get all blocks recursively
    const blocks = await getAllBlocksRecursively(pageId);

    // Extract image blocks
    const blockImages = extractImagesFromBlocks(blocks);

    return {
      propertyImages,
      blockImages,
      allImages: [...propertyImages, ...blockImages],
    };
  } catch (error) {
    return handleNotionError(`fetching images from page ${pageId}`, error, {
      propertyImages: [],
      blockImages: [],
      allImages: [],
    });
  }
}

// ===== Property Processing =====

/**
 * Process a Notion title property
 */
function processTitleProperty(property: NotionTitleProperty): string {
  return property.title[0]?.plain_text || "";
}

/**
 * Process a Notion rich text property
 */
function processRichTextProperty(property: NotionRichTextProperty): string {
  return property.rich_text[0]?.plain_text || "";
}

/**
 * Process a Notion URL property
 */
function processUrlProperty(property: NotionUrlProperty): string {
  return property.url || "";
}

/**
 * Process a Notion date property
 */
function processDateProperty(property: NotionDateProperty): string | null {
  return property.date?.start || null;
}

/**
 * Process a Notion multi-select property
 */
function processMultiSelectProperty(
  property: NotionMultiSelectProperty,
): string[] {
  return property.multi_select.map((item) => item.name);
}

/**
 * Process a Notion select property
 */
function processSelectProperty(property: NotionSelectProperty): string {
  return property.select?.name || "";
}

/**
 * Process a Notion files property
 */
function processFilesProperty(property: NotionFilesProperty): string[] {
  return property.files
    .map((file) => file.external?.url || file.file?.url || "")
    .filter((url) => url !== "");
}

/**
 * Helper function to parse Notion page properties
 * @param properties - The properties object from a Notion page
 * @returns Parsed properties in a more usable format
 */
export function parseNotionProperties(
  properties: Record<string, NotionProperty>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.keys(properties).forEach((key) => {
    const property = properties[key];

    switch (property.type) {
      case "title":
        result[key] = processTitleProperty(property as NotionTitleProperty);
        break;
      case "rich_text":
        result[key] = processRichTextProperty(
          property as NotionRichTextProperty,
        );
        break;
      case "url":
        result[key] = processUrlProperty(property as NotionUrlProperty);
        break;
      case "date":
        result[key] = processDateProperty(property as NotionDateProperty);
        break;
      case "multi_select":
        result[key] = processMultiSelectProperty(
          property as NotionMultiSelectProperty,
        );
        break;
      case "select":
        result[key] = processSelectProperty(property as NotionSelectProperty);
        break;
      case "files":
        result[key] = processFilesProperty(property as NotionFilesProperty);
        break;
      default:
        result[key] = property[property.type] || null;
    }
  });

  return result;
}

// ===== Page Content API =====

/**
 * Fetches a specific page by ID using the environment variable
 * @returns Page data or null if not found
 */
export async function getPage(): Promise<PageObjectResponse | null> {
  try {
    const pageId = import.meta.env.PUBLIC_NOTION_PAGE_ID;
    if (!pageId) {
      console.error(
        "PUBLIC_NOTION_PAGE_ID is not defined in environment variables",
      );
      return null;
    }

    const response = await notionClient.pages.retrieve({
      page_id: pageId,
    });

    return response as PageObjectResponse;
  } catch (error) {
    return handleNotionError("fetching page from Notion", error, null);
  }
}

/**
 * Fetches a page by its explicit ID
 * @param pageId - The Notion page ID
 * @returns Page data or null if not found
 */
export async function getPageById(
  pageId: string,
): Promise<PageObjectResponse | null> {
  try {
    const response = await notionClient.pages.retrieve({
      page_id: pageId,
    });

    return response as PageObjectResponse;
  } catch (error) {
    return handleNotionError(`fetching page with ID ${pageId}`, error, null);
  }
}

/**
 * Gets page content with processed blocks ready for rendering
 * @param pageId - Optional page ID (falls back to env variable if not provided)
 * @returns Object containing page metadata and content blocks
 */
export async function getPageContent(pageId?: string): Promise<{
  page: PageObjectResponse | null;
  blocks: BlockObjectResponse[];
  processedContent: ProcessedBlock[];
}> {
  try {
    const targetPageId = pageId || import.meta.env.PUBLIC_NOTION_PAGE_ID;

    if (!targetPageId) {
      console.error(
        "No page ID provided and PUBLIC_NOTION_PAGE_ID is not defined",
      );
      return { page: null, blocks: [], processedContent: [] };
    }

    // Get the page metadata
    const page = await getPageById(targetPageId);

    if (!page) {
      return { page: null, blocks: [], processedContent: [] };
    }

    // Get all blocks from the page
    const blocks = await getAllBlocksRecursively(targetPageId);

    // Process blocks for rendering
    const processedContent = processBlocksForRendering(blocks);

    return {
      page,
      blocks,
      processedContent,
    };
  } catch (error) {
    return handleNotionError(`fetching page content for ${pageId}`, error, {
      page: null,
      blocks: [],
      processedContent: [],
    });
  }
}

// ===== Block Processing for Rendering =====

/**
 * Process blocks for rendering in a hierarchical structure
 */
function processBlocksForRendering(
  blocks: BlockObjectResponse[],
  parentId?: string,
  level: number = 0,
): ProcessedBlock[] {
  const processedBlocks: ProcessedBlock[] = [];
  const directChildren = blocks.filter((block) => {
    // If we're processing top-level blocks, we only want blocks without a parent
    // Otherwise, we want blocks that are direct children of the specified parent
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

    // Process children recursively if this block has children
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
    case "callout":
      baseProcessedBlock.content = {
        text: processRichTextArray(block.callout.rich_text),
        icon: block.callout.icon,
      };
      break;
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
