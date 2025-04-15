import { getPageById } from "./notionPage";
import { parseNotionProperties } from "./notionProperties";
import { extractIcon } from "./notionIcons";
import { getBlockChildren } from "./notionBlocks";
import { processBlocksForRendering } from "./notionBlockRendering";
import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ProcessedBlock } from "../../types/notion";

export interface ProfileData {
  name: string;
  title: string;
  description: string;
  avatarUrl: string;
}

/**
 * Extracts profile data, intro blocks, and all top-level images from a Notion page for fast loading.
 * Only fetches top-level image blocks and cover image for performance.
 * @param pageId - The Notion page ID
 * @returns { profileData, introBlocks, images }
 */
export async function getProfileDataAndIntroBlocks(pageId: string): Promise<{
  profileData: ProfileData | null;
  introBlocks: ProcessedBlock[];
  images: string[];
}> {
  try {
    const page = await getPageById(pageId);
    if (!page) {
      return { profileData: null, introBlocks: [], images: [] };
    }
    // Parse the properties using the existing utility
    const properties = parseNotionProperties(page.properties);
    // Extract name, title, description
    const name =
      (properties.title as string) || (properties.Name as string) || "";
    const title =
      (properties.Title as string) ||
      (properties.title as string) ||
      (properties.Name as string) ||
      "";
    const description = (properties.Description as string) || "";
    // Extract avatar/profile image (icon or cover)
    let avatarUrl = "";
    const icon = extractIcon(page);
    if (icon) {
      avatarUrl = icon.value;
    } else if (page.cover?.type === "external" && page.cover.external.url) {
      avatarUrl = page.cover.external.url;
    }
    const profileData: ProfileData = { name, title, description, avatarUrl };
    // Fetch only the top-level blocks for performance
    const blocksResponse = await getBlockChildren(pageId);
    const introBlocks: ProcessedBlock[] = [];
    const images: string[] = [];
    if (blocksResponse && Array.isArray(blocksResponse.results)) {
      const allBlocks = blocksResponse.results.filter(
        (block): block is BlockObjectResponse =>
          typeof block === "object" && block !== null && "type" in block,
      );
      const processedBlocks = processBlocksForRendering(allBlocks);
      for (const block of processedBlocks) {
        if (block.type === "callout") break;
        if (
          block.type === "paragraph" ||
          block.type.startsWith("heading_") ||
          block.type === "image"
        ) {
          introBlocks.push(block);
        }
        // Collect all top-level image block URLs
        if (
          block.type === "image" &&
          typeof block.content === "object" &&
          block.content !== null &&
          "url" in block.content
        ) {
          images.push(block.content.url as string);
        }
      }
    }
    // Add cover image as first if no image blocks found
    if (
      images.length === 0 &&
      page.cover?.type === "external" &&
      page.cover.external.url
    ) {
      images.push(page.cover.external.url);
    }
    return { profileData, introBlocks, images };
  } catch (error) {
    console.error("Error in getProfileDataAndIntroBlocks:", error);
    return { profileData: null, introBlocks: [], images: [] };
  }
}
