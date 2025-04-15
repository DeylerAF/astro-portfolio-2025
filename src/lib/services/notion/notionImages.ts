import { getProductById } from "./notionProducts";
import { getAllBlocksRecursively } from "./notionBlocks";
import { parseNotionProperties } from "./notionProperties";
import { isImageUrl } from "./notionTypeGuards";
import { handleNotionError } from "./notionError";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

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
        .filter(
          (item: unknown) =>
            typeof item === "string" && isImageUrl(item as string),
        )
        .forEach((url: string) => imageUrls.push(url as string));
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
