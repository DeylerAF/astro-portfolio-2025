import type {
  NotionProperty,
  NotionTitleProperty,
  NotionRichTextProperty,
  NotionUrlProperty,
  NotionDateProperty,
  NotionMultiSelectProperty,
  NotionSelectProperty,
  NotionFilesProperty,
} from "../../types/notion";

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
    .map(
      (file: { external?: { url: string }; file?: { url: string } }) =>
        file.external?.url || file.file?.url || "",
    )
    .filter((url: string) => url !== "");
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
