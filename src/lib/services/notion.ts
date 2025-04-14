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

// Initialize the Notion client with your API token
const notion = new Client({
  auth: import.meta.env.PUBLIC_NOTION_TOKEN,
});

/**
 * Fetches all projects from the Notion database
 * @returns Array of projects from Notion
 */
export async function getProjects() {
  try {
    const response = await notion.databases.query({
      database_id: import.meta.env.PUBLIC_NOTION_DATABASE_ID,
      // You can add filters here if needed
      // For example:
      // filter: {
      //   property: 'Status',
      //   status: { equals: 'Published' }
      // },
      // sorts: [{ property: 'Date', direction: 'descending' }],
    });

    return response.results;
  } catch (error) {
    console.error("Error fetching projects from Notion:", error);
    return [];
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
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });

    return response as PageObjectResponse;
  } catch (error) {
    console.error(`Error fetching project with ID ${pageId}:`, error);
    return null;
  }
}

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
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    return response;
  } catch (error) {
    console.error(`Error fetching block children for ${blockId}:`, error);
    return {
      object: "list",
      type: "block",
      block: {},
      results: [],
      has_more: false,
      next_cursor: null,
    };
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
    // Type assertion to ensure we're dealing with BlockObjectResponse objects
    const blockResults = response.results.filter(
      (block): block is BlockObjectResponse => "type" in block,
    );
    blocks.push(...blockResults);

    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  // Recursively fetch children for blocks that can have children
  const blocksWithChildren: BlockObjectResponse[] = [];
  for (const block of blocks) {
    blocksWithChildren.push(block);

    // Check if the block has children
    if ("has_children" in block && block.has_children) {
      const childBlocks = await getAllBlocksRecursively(block.id);
      blocksWithChildren.push(...childBlocks);
    }
  }

  return blocksWithChildren;
}

/**
 * Extracts all image blocks from an array of Notion blocks
 * @param blocks - Array of Notion blocks
 * @returns Array of image URLs
 */
export function extractImagesFromBlocks(
  blocks: BlockObjectResponse[],
): string[] {
  const imageUrls: string[] = [];

  blocks.forEach((block) => {
    // Check for image block type
    if (block.type === "image") {
      const imageBlock = block.image;

      // Handle different image sources (external, file)
      if (imageBlock.type === "external") {
        imageUrls.push(imageBlock.external.url);
      } else if (imageBlock.type === "file") {
        imageUrls.push(imageBlock.file.url);
      }
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
      // Extract images from properties (e.g., cover image, files properties with images)
      const parsedProperties = parseNotionProperties(page.properties);

      // Get cover image if exists
      if ("cover" in page && page.cover) {
        if (page.cover.type === "external") {
          propertyImages.push(page.cover.external.url);
        } else if (page.cover.type === "file") {
          propertyImages.push(page.cover.file.url);
        }
      }

      // Get images from file properties
      Object.values(parsedProperties).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            // Check if the item is a URL that looks like an image
            if (
              typeof item === "string" &&
              (item.endsWith(".png") ||
                item.endsWith(".jpg") ||
                item.endsWith(".jpeg") ||
                item.endsWith(".gif") ||
                item.endsWith(".webp") ||
                item.includes("images.unsplash.com") ||
                item.includes("secure.notion-static.com"))
            ) {
              propertyImages.push(item);
            }
          });
        }
      });
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
    console.error(`Error fetching images from page ${pageId}:`, error);
    return { propertyImages: [], blockImages: [], allImages: [] };
  }
}

/**
 * Helper function to parse Notion page properties
 * @param properties - The properties object from a Notion page
 * @returns Parsed properties in a more usable format
 */
export function parseNotionProperties(
  properties: Record<string, NotionProperty>,
) {
  const result: Record<string, unknown> = {};

  Object.keys(properties).forEach((key) => {
    const property = properties[key];

    switch (property.type) {
      case "title":
        result[key] =
          (property as NotionTitleProperty).title[0]?.plain_text || "";
        break;
      case "rich_text":
        result[key] =
          (property as NotionRichTextProperty).rich_text[0]?.plain_text || "";
        break;
      case "url":
        result[key] = (property as NotionUrlProperty).url || "";
        break;
      case "date":
        result[key] = (property as NotionDateProperty).date?.start || null;
        break;
      case "multi_select":
        result[key] = (property as NotionMultiSelectProperty).multi_select.map(
          (item) => item.name,
        );
        break;
      case "select":
        result[key] = (property as NotionSelectProperty).select?.name || "";
        break;
      case "files":
        result[key] = (property as NotionFilesProperty).files.map(
          (file) => file.external?.url || file.file?.url || "",
        );
        break;
      default:
        result[key] = property[property.type] || null;
    }
  });

  return result;
}
