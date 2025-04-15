import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Type guard to check if a block is a BlockObjectResponse
 */
export function isBlockObjectResponse(
  block: unknown,
): block is BlockObjectResponse {
  return typeof block === "object" && block !== null && "type" in block;
}

/**
 * Type guard to check if a response is a PageObjectResponse
 */
export function isPageObjectResponse(
  response: unknown,
): response is PageObjectResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "properties" in response
  );
}

/**
 * Type guard to check if a block has children
 */
export function hasChildren(block: BlockObjectResponse): boolean {
  return "has_children" in block && block.has_children === true;
}

/**
 * Type guard to check if a string is an image URL
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const imageDomains = ["images.unsplash.com", "secure.notion-static.com"];

  return (
    imageExtensions.some((ext) => url.endsWith(ext)) ||
    imageDomains.some((domain) => url.includes(domain))
  );
}
