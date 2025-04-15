import { notionClient } from "./notionClient";
import { isPageObjectResponse } from "./notionTypeGuards";
import { handleNotionError } from "./notionError";
import { getAllBlocksRecursively } from "./notionBlocks";
import { processBlocksForRendering } from "./notionBlockRendering";
import type {
  PageObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { ProcessedBlock } from "../../types/notion";

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
    if (!isPageObjectResponse(response)) {
      throw new Error("Invalid response from Notion API");
    }
    return response;
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
