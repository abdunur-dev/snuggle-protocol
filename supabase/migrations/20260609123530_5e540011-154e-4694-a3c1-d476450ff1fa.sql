
CREATE TABLE public.mcp_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  github_url TEXT NOT NULL,
  install_command TEXT NOT NULL,
  config_snippet TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  install_count INTEGER NOT NULL DEFAULT 0,
  star_rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT false,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mcp_servers TO anon;
GRANT SELECT, INSERT ON public.mcp_servers TO authenticated;
GRANT ALL ON public.mcp_servers TO service_role;

ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved servers are publicly viewable"
  ON public.mcp_servers FOR SELECT
  USING (approved = true);

CREATE POLICY "Authenticated users can submit servers"
  ON public.mcp_servers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by AND approved = false);

CREATE INDEX idx_mcp_servers_category ON public.mcp_servers(category);
CREATE INDEX idx_mcp_servers_approved ON public.mcp_servers(approved);

INSERT INTO public.mcp_servers (name, slug, description, category, github_url, install_command, config_snippet, author_name, author_email, install_count, star_rating, approved) VALUES
('Gmail MCP', 'gmail-mcp', 'Send and read emails directly from your AI agent. Full Gmail API access including search, labels, drafts, and attachments.', 'Communication', 'https://github.com/GongRzhe/Gmail-MCP-Server', 'npx -y @gongrzhe/server-gmail-autoauth-mcp', '{"mcpServers":{"gmail":{"command":"npx","args":["-y","@gongrzhe/server-gmail-autoauth-mcp"]}}}', 'GongRzhe', 'hello@example.com', 12500, 4.8, true),
('Google Calendar MCP', 'google-calendar-mcp', 'Manage Google Calendar events, create meetings, check availability, and schedule across multiple calendars.', 'Productivity', 'https://github.com/nspady/google-calendar-mcp', 'npx -y @cocal/google-calendar-mcp', '{"mcpServers":{"google-calendar":{"command":"npx","args":["-y","@cocal/google-calendar-mcp"]}}}', 'nspady', 'hello@example.com', 9800, 4.7, true),
('Notion MCP', 'notion-mcp', 'Read and write Notion pages, databases, and blocks. Perfect for knowledge management workflows.', 'Productivity', 'https://github.com/makenotion/notion-mcp-server', 'npx -y @notionhq/notion-mcp-server', '{"mcpServers":{"notion":{"command":"npx","args":["-y","@notionhq/notion-mcp-server"],"env":{"NOTION_API_KEY":"your-key"}}}}', 'Notion', 'hello@example.com', 24300, 4.9, true),
('GitHub MCP', 'github-mcp', 'Manage repositories, issues, pull requests, and code search. Official GitHub MCP server.', 'Dev Tools', 'https://github.com/github/github-mcp-server', 'docker run -i --rm ghcr.io/github/github-mcp-server', '{"mcpServers":{"github":{"command":"docker","args":["run","-i","--rm","ghcr.io/github/github-mcp-server"],"env":{"GITHUB_TOKEN":"your-token"}}}}', 'GitHub', 'hello@example.com', 45200, 4.9, true),
('Stripe MCP', 'stripe-mcp', 'Handle payments, customers, subscriptions, and invoices through Stripe''s payment platform.', 'Finance', 'https://github.com/stripe/agent-toolkit', 'npx -y @stripe/mcp', '{"mcpServers":{"stripe":{"command":"npx","args":["-y","@stripe/mcp","--tools=all"],"env":{"STRIPE_SECRET_KEY":"sk_..."}}}}', 'Stripe', 'hello@example.com', 8700, 4.6, true),
('Slack MCP', 'slack-mcp', 'Send messages, read channels, manage workspaces, and search Slack history from your AI agent.', 'Communication', 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack', 'npx -y @modelcontextprotocol/server-slack', '{"mcpServers":{"slack":{"command":"npx","args":["-y","@modelcontextprotocol/server-slack"],"env":{"SLACK_BOT_TOKEN":"xoxb-..."}}}}', 'Anthropic', 'hello@example.com', 18900, 4.7, true),
('Google Drive MCP', 'google-drive-mcp', 'Manage files and folders in Google Drive. List, search, upload, and download with full permissions support.', 'Storage', 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive', 'npx -y @modelcontextprotocol/server-gdrive', '{"mcpServers":{"gdrive":{"command":"npx","args":["-y","@modelcontextprotocol/server-gdrive"]}}}', 'Anthropic', 'hello@example.com', 14600, 4.6, true),
('Linear MCP', 'linear-mcp', 'Create, update, and search Linear issues. Built for engineering teams to manage tasks from AI.', 'Productivity', 'https://github.com/jerhadf/linear-mcp-server', 'npx -y linear-mcp-server', '{"mcpServers":{"linear":{"command":"npx","args":["-y","linear-mcp-server"],"env":{"LINEAR_API_KEY":"lin_api_..."}}}}', 'jerhadf', 'hello@example.com', 7400, 4.5, true);
