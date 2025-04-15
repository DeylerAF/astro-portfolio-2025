import { Client } from "@notionhq/client";

/**
 * Singleton Notion client to centralize API access
 */
export class NotionClient {
  private static instance: NotionClient;
  private client: Client;

  private constructor() {
    this.client = new Client({
      auth: import.meta.env.PUBLIC_NOTION_TOKEN,
    });
  }

  static getInstance(): NotionClient {
    if (!NotionClient.instance) {
      NotionClient.instance = new NotionClient();
    }
    return NotionClient.instance;
  }

  getClient(): Client {
    return this.client;
  }
}

// Get the Notion client instance
export const notionClient = NotionClient.getInstance().getClient();
