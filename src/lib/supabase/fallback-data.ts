export interface FallbackServer {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  github_url: string;
  install_command: string;
  config_snippet: string;
  author_name: string;
  author_email: string;
  install_count: number;
  star_rating: number;
  approved: boolean;
  created_at: string;
}

export const FALLBACK_SERVERS: FallbackServer[] = [
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120001",
    name: "Gmail MCP",
    slug: "gmail-mcp",
    description: "Send and read emails directly from your AI agent. Full Gmail API access including search, labels, drafts, and attachments.",
    category: "Communication",
    github_url: "https://github.com/GongRzhe/Gmail-MCP-Server",
    install_command: "npx -y @gongrzhe/server-gmail-autoauth-mcp",
    config_snippet: '{"mcpServers":{"gmail":{"command":"npx","args":["-y","@gongrzhe/server-gmail-autoauth-mcp"]}}}',
    author_name: "GongRzhe",
    author_email: "hello@example.com",
    install_count: 12500,
    star_rating: 4.8,
    approved: true,
    created_at: "2026-06-09T12:00:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120002",
    name: "Google Calendar MCP",
    slug: "google-calendar-mcp",
    description: "Manage Google Calendar events, create meetings, check availability, and schedule across multiple calendars.",
    category: "Productivity",
    github_url: "https://github.com/nspady/google-calendar-mcp",
    install_command: "npx -y @cocal/google-calendar-mcp",
    config_snippet: '{"mcpServers":{"google-calendar":{"command":"npx","args":["-y","@cocal/google-calendar-mcp"]}}}',
    author_name: "nspady",
    author_email: "hello@example.com",
    install_count: 9800,
    star_rating: 4.7,
    approved: true,
    created_at: "2026-06-09T12:01:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120003",
    name: "Notion MCP",
    slug: "notion-mcp",
    description: "Read and write Notion pages, databases, and blocks. Perfect for knowledge management workflows.",
    category: "Productivity",
    github_url: "https://github.com/makenotion/notion-mcp-server",
    install_command: "npx -y @notionhq/notion-mcp-server",
    config_snippet: '{"mcpServers":{"notion":{"command":"npx","args":["-y","@notionhq/notion-mcp-server"],"env":{"NOTION_API_KEY":"your-key"}}}}',
    author_name: "Notion",
    author_email: "hello@example.com",
    install_count: 24300,
    star_rating: 4.9,
    approved: true,
    created_at: "2026-06-09T12:02:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120004",
    name: "GitHub MCP",
    slug: "github-mcp",
    description: "Manage repositories, issues, pull requests, and code search. Official GitHub MCP server.",
    category: "Dev Tools",
    github_url: "https://github.com/github/github-mcp-server",
    install_command: "docker run -i --rm ghcr.io/github/github-mcp-server",
    config_snippet: '{"mcpServers":{"github":{"command":"docker","args":["run","-i","--rm","ghcr.io/github/github-mcp-server"],"env":{"GITHUB_TOKEN":"your-token"}}}}',
    author_name: "GitHub",
    author_email: "hello@example.com",
    install_count: 45200,
    star_rating: 4.9,
    approved: true,
    created_at: "2026-06-09T12:03:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120005",
    name: "Stripe MCP",
    slug: "stripe-mcp",
    description: "Handle payments, customers, subscriptions, and invoices through Stripe's payment platform.",
    category: "Finance",
    github_url: "https://github.com/stripe/agent-toolkit",
    install_command: "npx -y @stripe/mcp",
    config_snippet: '{"mcpServers":{"stripe":{"command":"npx","args":["-y","@stripe/mcp","--tools=all"],"env":{"STRIPE_SECRET_KEY":"sk_..."}}}}',
    author_name: "Stripe",
    author_email: "hello@example.com",
    install_count: 8700,
    star_rating: 4.6,
    approved: true,
    created_at: "2026-06-09T12:04:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120006",
    name: "Slack MCP",
    slug: "slack-mcp",
    description: "Send messages, read channels, manage workspaces, and search Slack history from your AI agent.",
    category: "Communication",
    github_url: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    install_command: "npx -y @modelcontextprotocol/server-slack",
    config_snippet: '{"mcpServers":{"slack":{"command":"npx","args":["-y","@modelcontextprotocol/server-slack"],"env":{"SLACK_BOT_TOKEN":"xoxb-..."}}}}',
    author_name: "Anthropic",
    author_email: "hello@example.com",
    install_count: 18900,
    star_rating: 4.7,
    approved: true,
    created_at: "2026-06-09T12:05:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120007",
    name: "Google Drive MCP",
    slug: "google-drive-mcp",
    description: "Manage files and folders in Google Drive. List, search, upload, and download with full permissions support.",
    category: "Storage",
    github_url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    install_command: "npx -y @modelcontextprotocol/server-gdrive",
    config_snippet: '{"mcpServers":{"gdrive":{"command":"npx","args":["-y","@modelcontextprotocol/server-gdrive"]}}}',
    author_name: "Anthropic",
    author_email: "hello@example.com",
    install_count: 14600,
    star_rating: 4.6,
    approved: true,
    created_at: "2026-06-09T12:06:00Z"
  },
  {
    id: "f1b8a514-d830-4e36-af44-2ee178120008",
    name: "Linear MCP",
    slug: "linear-mcp",
    description: "Create, update, and search Linear issues. Built for engineering teams to manage tasks from AI.",
    category: "Productivity",
    github_url: "https://github.com/jerhadf/linear-mcp-server",
    install_command: "npx -y linear-mcp-server",
    config_snippet: '{"mcpServers":{"linear":{"command":"npx","args":["-y","linear-mcp-server"],"env":{"LINEAR_API_KEY":"lin_api_..."}}}}',
    author_name: "jerhadf",
    author_email: "hello@example.com",
    install_count: 7400,
    star_rating: 4.5,
    approved: true,
    created_at: "2026-06-09T12:07:00Z"
  }
];
