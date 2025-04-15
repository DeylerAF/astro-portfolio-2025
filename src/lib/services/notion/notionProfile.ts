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
 * Extracts profile data and intro blocks from a Notion page
 * @param pageId - The Notion page ID
 * @returns { profileData, introBlocks }
 */
export async function getProfileDataAndIntroBlocks(pageId: string): Promise<{
  profileData: ProfileData | null;
  introBlocks: ProcessedBlock[];
}> {
  try {
    const page = await getPageById(pageId);
    if (!page) {
      return { profileData: null, introBlocks: [] };
    }
    // Parse the properties using the existing utility
    const properties = parseNotionProperties(page.properties);
    // Extract name, title, description
    const name =
      (properties.title as string) || (properties.Name as string) || "";
    // Improved title extraction: check for 'Title', 'title', then 'Name'
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
    // Fetch the page blocks
    const blocksResponse = await getBlockChildren(pageId);
    const introBlocks: ProcessedBlock[] = [];
    if (blocksResponse && Array.isArray(blocksResponse.results)) {
      // Use the existing function to process blocks
      const allBlocks = blocksResponse.results.filter(
        (block): block is BlockObjectResponse =>
          typeof block === "object" && block !== null && "type" in block,
      );
      // Process blocks for rendering
      const processedBlocks = processBlocksForRendering(allBlocks);
      // Get intro blocks (stop at first callout which is typically a section heading)
      for (const block of processedBlocks) {
        if (block.type === "callout") {
          break;
        }
        if (
          block.type === "paragraph" ||
          block.type.startsWith("heading_") ||
          block.type === "image"
        ) {
          introBlocks.push(block);
        }
      }
    }
    return { profileData, introBlocks };
  } catch (error) {
    console.error("Error in getProfileDataAndIntroBlocks:", error);
    return { profileData: null, introBlocks: [] };
  }
}
