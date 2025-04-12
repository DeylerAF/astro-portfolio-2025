import { Client } from "@notionhq/client";

// Define interfaces for Notion property types
interface NotionPropertyValue {
  type: string;
  [key: string]: unknown;
}

interface NotionTitleProperty extends NotionPropertyValue {
  type: "title";
  title: Array<{ plain_text: string }>;
}

interface NotionRichTextProperty extends NotionPropertyValue {
  type: "rich_text";
  rich_text: Array<{ plain_text: string }>;
}

interface NotionUrlProperty extends NotionPropertyValue {
  type: "url";
  url: string | null;
}

interface NotionDateProperty extends NotionPropertyValue {
  type: "date";
  date: { start: string } | null;
}

interface NotionMultiSelectProperty extends NotionPropertyValue {
  type: "multi_select";
  multi_select: Array<{ name: string }>;
}

interface NotionSelectProperty extends NotionPropertyValue {
  type: "select";
  select: { name: string } | null;
}

interface NotionFilesProperty extends NotionPropertyValue {
  type: "files";
  files: Array<{
    type: string;
    name: string;
    external?: { url: string };
    file?: { url: string };
  }>;
}

type NotionProperty =
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionUrlProperty
  | NotionDateProperty
  | NotionMultiSelectProperty
  | NotionSelectProperty
  | NotionFilesProperty
  | NotionPropertyValue;

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
export async function getProjectById(pageId: string) {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });

    return response;
  } catch (error) {
    console.error(`Error fetching project with ID ${pageId}:`, error);
    return null;
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
