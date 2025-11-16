import { Client } from '@notionhq/client';

export class NotionService {
  private notion: Client;
  private databaseId: string;

  constructor(token: string, databaseId: string) {
    this.notion = new Client({ auth: token });
    this.databaseId = databaseId;
  }

  async createPage(title: string, content: string, metadata?: Record<string, any>) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          ...metadata,
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      });
      return response;
    } catch (error) {
      console.error('Error creating Notion page:', error);
      throw error;
    }
  }

  async createCommitPage(commitData: {
    title: string;
    message: string;
    author: string;
    date: string;
    sha: string;
    url: string;
    files: string[];
  }) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: commitData.title,
                },
              },
            ],
          },
          Author: {
            rich_text: [
              {
                text: {
                  content: commitData.author,
                },
              },
            ],
          },
          Date: {
            date: {
              start: commitData.date,
            },
          },
          SHA: {
            rich_text: [
              {
                text: {
                  content: commitData.sha,
                },
              },
            ],
          },
          URL: {
            url: commitData.url,
          },
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'Commit Message',
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: commitData.message,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'Changed Files',
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: commitData.files.map((file) => ({
                type: 'text',
                text: {
                  content: file,
                },
              })),
            },
          },
        ],
      });
      return response;
    } catch (error) {
      console.error('Error creating commit page in Notion:', error);
      throw error;
    }
  }
}
