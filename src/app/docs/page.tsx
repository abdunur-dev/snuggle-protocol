"use client";

import { useState, useEffect } from "react";
import { 
  Terminal, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink 
} from "lucide-react";
import Link from "next/link";

interface DocSection {
  id: string;
  title: string;
  category: string;
}

const DOC_SECTIONS: DocSection[] = [
  { id: "intro", title: "Introduction to MCP", category: "Getting Started" },
  { id: "quickstart", title: "Quick Start Guide", category: "Getting Started" },
  { id: "configuration", title: "Claude Desktop Config", category: "Configuration" },
  { id: "servers", title: "Supported MCP Servers", category: "Servers Registry" },
  { id: "vercel-integration", title: "Vercel SDK Setup", category: "Advanced" },
  { id: "troubleshoot", title: "Troubleshooting & FAQs", category: "Advanced" },
];

function DocsCodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-200 bg-[#0d0d0d] text-zinc-100 max-w-full font-sans shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1e] border-b border-zinc-800 text-xs text-zinc-400 select-none">
        <span className="font-mono lowercase text-[11px] font-medium tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors py-0.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy config</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre select-text">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);

  const categories = Array.from(new Set(DOC_SECTIONS.map((s) => s.category)));

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
              Documentation & Guides
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Learn how to configure, run, and scale Model Context Protocol (MCP) servers locally or on production.
            </p>
          </div>
          
          <div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-md"
            >
              <span>Ask MCP Assistant</span>
              <span className="font-serif italic font-normal text-zinc-300">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Main Doc Panels Container */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex min-h-[580px] relative">
          
          {/* Collapsible Left Sidebar */}
          <aside 
            className={`flex flex-col bg-gray-50/70 border-r border-gray-200 transition-all duration-300 overflow-hidden select-none ${
              sidebarCollapsed ? "w-0 opacity-0" : "w-[260px] opacity-100"
            }`}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {categories.map((cat) => (
                <div key={cat} className="space-y-1">
                  <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 py-1">
                    {cat}
                  </h3>
                  <div className="space-y-0.5">
                    {DOC_SECTIONS.filter((s) => s.category === cat).map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                          activeSection === section.id 
                            ? "bg-white border border-gray-200 text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50/30 text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>MCP Protocol v1.0</span>
              <a 
                href="https://modelcontextprotocol.io" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 hover:text-gray-700 transition"
              >
                <span>Official Spec</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </aside>

          {/* Right Doc Article Panel */}
          <article className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[680px] scrollbar-thin select-text">
            
            {/* Collapse toggle in content header */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 select-none">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition"
                title={sidebarCollapsed ? "Expand topics" : "Collapse topics"}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
              </button>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <span>Docs</span>
                <span>/</span>
                <span className="text-gray-700">
                  {DOC_SECTIONS.find((s) => s.id === activeSection)?.title}
                </span>
              </div>
            </div>

            {/* Render selected section content */}
            {activeSection === "intro" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Model Context Protocol (MCP)</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The **Model Context Protocol (MCP)** is an open-standard protocol designed to enable secure, context-aware integration between Large Language Models (LLMs) and local or remote data sources, databases, and APIs.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Instead of writing ad-hoc API integrations for every plugin or tool, MCP offers a unified framework. Developers write **MCP Servers** which expose:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm text-gray-600">
                  <li><strong>Prompts:</strong> Pre-structured templates or system instructions for LLM ingestion.</li>
                  <li><strong>Resources:</strong> Semi-structured data (text files, logs, database queries) that the LLM can read.</li>
                  <li><strong>Tools:</strong> Actionable functions (creating files, sending Slack alerts, scheduling meetings) that the LLM can call.</li>
                </ul>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-500 leading-relaxed mt-4">
                  <strong>Why MCPHub?</strong> MCPHub serves as an open marketplace and registry where you can discover community-validated MCP servers, look up their configurations, and immediately plug them into your desktop workflows.
                </div>
              </div>
            )}

            {activeSection === "quickstart" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Quick Start Guide</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Follow these three simple steps to start using Model Context Protocol servers locally in Claude Desktop:
                </p>
                
                <h3 className="text-base font-bold text-gray-900 mt-4">Step 1: Install node/npm</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Most MCP servers run inside the node environment. Verify node is installed on your local terminal:
                </p>
                <div className="p-3 rounded-lg bg-gray-900 text-zinc-100 font-mono text-xs max-w-full overflow-x-auto shadow-sm">
                  node -v
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-4">Step 2: Configure Claude Desktop</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Open your Claude configuration file. Under Windows, navigate to:
                </p>
                <div className="p-3 rounded-lg bg-gray-900 text-zinc-100 font-mono text-xs max-w-full overflow-x-auto shadow-sm">
                  %APPDATA%\Claude\claude_desktop_config.json
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Paste the JSON snippet configuration for the servers you wish to enable.
                </p>

                <h3 className="text-base font-bold text-gray-900 mt-4">Step 3: Restart Claude Desktop</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Restart your Claude Desktop client. A hammer/tool icon will appear at the bottom-right of your chat panel, indicating the local tools are ready!
                </p>
              </div>
            )}

            {activeSection === "configuration" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Configuring Claude Desktop</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Claude Desktop utilizes a JSON configuration file to resolve and initialize local or remote MCP servers. Below is a structured example configuration showing multiple enabled servers:
                </p>
                
                <DocsCodeBlock 
                  code={`{
  "mcpServers": {
    "slack-integration": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token"
      }
    },
    "github-integration": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_personal_token"
      }
    }
  }
}`}
                />
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  Note that each server is keyed inside the `mcpServers` object with its unique installation script, parameters, and relevant API tokens defined inside `env`.
                </p>
              </div>
            )}

            {activeSection === "servers" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Supported MCP Registry Servers</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Below are configuration snippets for the core verified servers registered in our MCPHub ecosystem:
                </p>

                <div className="space-y-6 mt-4">
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900">1. GitHub Server</h4>
                    <p className="text-xs text-gray-500 mt-1">Exposes tool capabilities to read, search, search pull-requests, fork repos, and review files.</p>
                    <DocsCodeBlock 
                      code={`"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
  }
}`}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900">2. Slack Server</h4>
                    <p className="text-xs text-gray-500 mt-1">Exposes channels, posts notifications, sends direct messages, and queries history logs.</p>
                    <DocsCodeBlock 
                      code={`"slack": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "your-slack-bot-token"
  }
}`}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900">3. PostgreSQL Database Server</h4>
                    <p className="text-xs text-gray-500 mt-1">Exposes raw schema retrieval, read queries, transaction execution, and index optimization analysis.</p>
                    <DocsCodeBlock 
                      code={`"postgres": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/dbname"]
}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "vercel-integration" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Vercel AI SDK Integration</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If you are building custom web applications with Next.js or React, you can integrate Model Context Protocol servers directly using the Vercel AI SDK.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Install the core MCP client module:
                </p>
                <div className="p-3 rounded-lg bg-gray-900 text-zinc-100 font-mono text-xs max-w-full overflow-x-auto shadow-sm">
                  npm install @modelcontextprotocol/sdk
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Use the code below inside your serverless actions to dynamically request capabilities:
                </p>
                
                <DocsCodeBlock 
                  language="typescript"
                  code={`import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN!
  }
});

const client = new Client({
  name: "custom-nextjs-agent",
  version: "1.0.0"
});

await client.connect(transport);

// Fetch available tools
const tools = await client.listTools();
console.log("Enabled Tools:", tools);`}
                />
              </div>
            )}

            {activeSection === "troubleshoot" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Troubleshooting & FAQ</h2>
                
                <h4 className="text-sm font-bold text-gray-900 mt-4">Q: Claude Desktop throws an error on launch after configuration.</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This is usually due to invalid JSON syntax. Ensure your commas and brackets are perfectly formatted in `claude_desktop_config.json`. Check that env variables are wrapped inside quotes.
                </p>

                <h4 className="text-sm font-bold text-gray-900 mt-4">Q: Commands run with `npx` are hanging.</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  NPX requires internet access on first launch to download dependencies. Try running the command manually in your terminal to see if any user prompts (like accepting package terms) are blocking execution.
                </p>

                <h4 className="text-sm font-bold text-gray-900 mt-4">Q: Can I run Python-based servers?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Yes, but you will need to replace the `"command": "npx"` with `"command": "python"` or `"command": "uv"` and specify the local path to your script.
                </p>
              </div>
            )}

          </article>
        </div>

      </div>
    </div>
  );
}
