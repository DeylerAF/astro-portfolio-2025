import { notionClient } from "./notionClient";
import { handleNotionError } from "./notionError";
import { isBlockObjectResponse, hasChildren } from "./notionTypeGuards";
import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";

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
