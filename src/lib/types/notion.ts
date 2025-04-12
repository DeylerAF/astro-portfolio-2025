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
