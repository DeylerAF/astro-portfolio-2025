import { notionClient } from "./notionClient";
import { handleNotionError } from "./notionError";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
