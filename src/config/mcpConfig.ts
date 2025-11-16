export const mcpConfig = {
  github: {
    enabled: true,
    apiVersion: '2022-11-28',
  },
  notion: {
    enabled: true,
    apiVersion: '2022-06-28',
  },
  automation: {
    autoSync: false,
    syncInterval: 300000, // 5 minutes
  },
};

export interface MCPWorkflowConfig {
  source: 'github';
  destination: 'notion';
  transform?: (data: any) => any;
  filters?: {
    branches?: string[];
    authors?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export const defaultWorkflow: MCPWorkflowConfig = {
  source: 'github',
  destination: 'notion',
  transform: (commitData) => ({
    title: `[Commit] ${commitData.commit.message.split('\n')[0]}`,
    message: commitData.commit.message,
    author: commitData.commit.author.name,
    date: commitData.commit.author.date,
    sha: commitData.sha.substring(0, 7),
    url: commitData.html_url,
    files: commitData.files?.map((f: any) => f.filename) || [],
  }),
};
