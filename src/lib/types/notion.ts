// Type definitions for Notion API

export interface NotionPropertyValue {
  type: string;
  [key: string]: unknown;
}

export interface NotionTitleProperty extends NotionPropertyValue {
  type: "title";
  title: Array<{ plain_text: string }>;
}

export interface NotionRichTextProperty extends NotionPropertyValue {
  type: "rich_text";
  rich_text: Array<{ plain_text: string }>;
}

export interface NotionUrlProperty extends NotionPropertyValue {
  type: "url";
  url: string | null;
}

export interface NotionDateProperty extends NotionPropertyValue {
  type: "date";
  date: { start: string } | null;
}

export interface NotionMultiSelectProperty extends NotionPropertyValue {
  type: "multi_select";
  multi_select: Array<{ name: string }>;
}

export interface NotionSelectProperty extends NotionPropertyValue {
  type: "select";
  select: { name: string } | null;
}

export interface NotionFilesProperty extends NotionPropertyValue {
  type: "files";
  files: Array<{
    type: string;
    name: string;
    external?: { url: string };
    file?: { url: string };
  }>;
}

export type NotionProperty =
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionUrlProperty
  | NotionDateProperty
  | NotionMultiSelectProperty
  | NotionSelectProperty
  | NotionFilesProperty
  | NotionPropertyValue;

/**
 * Interface for rich text annotation properties
 */
export interface RichTextAnnotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

/**
 * Interface for processed rich text items
 */
export interface RichTextItem {
  text: string;
  href: string | null;
  annotations: RichTextAnnotations;
  type: string;
}

/**
 * Union type for various block content structures
 */
export type BlockContent =
  | RichTextItem[]
  | string
  | null
  | { text: RichTextItem[] | string; checked?: boolean }
  | { text: RichTextItem[] | string; language?: string }
  | {
      text: RichTextItem[] | string;
      icon?: {
        type: string;
        emoji?: string;
        file?: { url: string };
        external?: { url: string };
      } | null;
    }
  | { url: string; caption?: RichTextItem[] | string }
  | { title: string }
  | { message: string };

/**
 * Interface for a processed Notion block ready for rendering
 */
export interface ProcessedBlock {
  id: string;
  type: string;
  content: BlockContent;
  children?: ProcessedBlock[];
  hasChildren: boolean;
  level?: number;
}
