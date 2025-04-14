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

// ===== Project API =====

/**
 * Fetches all projects from the Notion database
 * @returns Array of projects from Notion
 */
export async function getProjects() {
  try {
    const response = await notionClient.databases.query({
      database_id: import.meta.env.PUBLIC_NOTION_DATABASE_ID,
    });

    return response.results;
  } catch (error) {
    return handleNotionError("fetching projects from Notion", error, []);
  }
}

/**
 * Fetches a single project by its ID
 * @param pageId - The Notion page ID of the project
 * @returns Project data or null if not found
 */
export async function getProjectById(
  pageId: string,
): Promise<PageObjectResponse | null> {
  try {
    const response = await notionClient.pages.retrieve({
      page_id: pageId,
    });

    return response as PageObjectResponse;
  } catch (error) {
    return handleNotionError(`fetching project with ID ${pageId}`, error, null);
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
    const page = await getProjectById(pageId);
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
