"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ContentSegment {
  type: "text" | "code";
  content: string;
  language?: string;
}

// Simple markdown/codeblock parser
function parseMarkdown(text: string): ContentSegment[] {
  const parts = text.split(/```/);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // Code block segment
      const firstLineBreak = part.indexOf("\n");
      let language = "";
      let code = part;
      
      if (firstLineBreak !== -1) {
        language = part.substring(0, firstLineBreak).trim();
        code = part.substring(firstLineBreak + 1).trim();
      }
      return { type: "code", content: code, language };
    } else {
      // Text segment
      return { type: "text", content: part };
    }
  });
}

// Custom code block component matching Vercel/ChatGPT styling
function ChatCodeBlock({ code, language }: { code: string; language?: string }) {
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
        <span className="font-mono lowercase text-[11px] font-medium tracking-wide">{language || "text"}</span>
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
              <span>Copy code</span>
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

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat sessions on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("mcphub_chat_sessions");
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }

    // Auto-collapse sidebar on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);

  // Save chat sessions when they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mcphub_chat_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput("");
    setError(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setInput("");
      setError(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend !== undefined ? textToSend.trim() : input.trim();
    if (!messageText || isLoading) return;

    if (textToSend === undefined) {
      setInput("");
    }
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = { role: "user", content: messageText };

    let currentSessionId = activeSessionId;
    let currentSession = sessions.find((s) => s.id === currentSessionId);

    if (!currentSession) {
      // Create new session
      currentSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: currentSessionId,
        title: messageText.length > 30 ? messageText.substring(0, 30) + "..." : messageText,
        messages: [userMsg],
        createdAt: Date.now(),
      };
      
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(currentSessionId);
      currentSession = newSession;
    } else {
      // Append user message
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMsg],
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? updatedSession : s))
      );
      currentSession = updatedSession;
    }

    // Keep reference of previous messages to send to API
    const historyPayload = currentSession.messages.slice(0, -1);

    // Append a placeholder for the assistant response in state
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...s.messages, { role: "assistant", content: "" }],
            }
          : s
      )
    );

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: historyPayload,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let assistantReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: [
                    ...currentSession!.messages,
                    { role: "assistant", content: assistantReply },
                  ],
                }
              : s
          )
        );
      }
    } catch (err: any) {
      console.error("[ChatPage] Error calling API stream:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      
      // Rollback assistant message on error
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: currentSession!.messages,
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderBlocks = (text: string) => {
    const lines = text.split("\n");
    const blocks: React.ReactNode[] = [];
    let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

    const pushCurrentList = () => {
      if (currentList) {
        if (currentList.type === "ul") {
          blocks.push(
            <ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-1.5 my-2 text-gray-700">
              {currentList.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{renderFormattedText(item)}</li>
              ))}
            </ul>
          );
        } else {
          blocks.push(
            <ol key={`ol-${blocks.length}`} className="list-decimal pl-6 space-y-1.5 my-2 text-gray-700">
              {currentList.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{renderFormattedText(item)}</li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for bullet list
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!currentList || currentList.type !== "ul") {
          pushCurrentList();
          currentList = { type: "ul", items: [] };
        }
        currentList.items.push(trimmed.slice(2));
      }
      // Check for numbered list
      else if (/^\d+\.\s+/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        const content = match ? match[2] : trimmed;
        if (!currentList || currentList.type !== "ol") {
          pushCurrentList();
          currentList = { type: "ol", items: [] };
        }
        currentList.items.push(content);
      }
      // Empty line
      else if (trimmed === "") {
        pushCurrentList();
        blocks.push(<div key={`spacer-${i}`} className="h-2" />);
      }
      // Regular paragraph
      else {
        pushCurrentList();
        blocks.push(
          <p key={`p-${i}`} className="my-1 text-gray-700 leading-relaxed break-words">
            {renderFormattedText(line)}
          </p>
        );
      }
    }
    pushCurrentList();
    return blocks;
  };

  const renderMessageContent = (content: string, isStreamingActive: boolean) => {
    if (!content && isStreamingActive) {
      return (
        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-middle" />
      );
    }

    const segments = parseMarkdown(content);
    return (
      <div className="space-y-2 select-text">
        {segments.map((segment, segIdx) => {
          const isLastSegment = segIdx === segments.length - 1;
          if (segment.type === "code") {
            return (
              <ChatCodeBlock
                key={segIdx}
                code={segment.content}
                language={segment.language}
              />
            );
          } else {
            return (
              <div key={segIdx} className="inline">
                {renderBlocks(segment.content)}
                {isLastSegment && isStreamingActive && (
                  <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-middle ml-1" />
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const suggestionCards = [
    "I'm building a coding agent",
    "I need an email and calendar agent",
    "I want an e-commerce automation agent",
    "I need a research and data agent"
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
              MCP Registry Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Ask questions or describe your agent capabilities to discover recommended MCP servers.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Read local Docs</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Box */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex h-[620px] relative">
          
          {/* Collapsible Left Sidebar */}
          <aside 
            className={`flex flex-col bg-gray-50/70 border-r border-gray-200 transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? "w-0 opacity-0" : "w-[260px] opacity-100"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50/30 select-none">
              <button
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 text-gray-500" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Sidebar History Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin select-none">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2.5 py-1">
                Recent Chats
              </div>
              {sessions.length === 0 ? (
                <div className="text-xs text-gray-400 px-3 py-2 italic">
                  No chat history
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setError(null);
                    }}
                    className={`group flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg cursor-pointer transition ${
                      activeSessionId === session.id 
                        ? "bg-white border border-gray-200 text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate pr-2">{session.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-gray-150 rounded transition"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50/30 text-[10px] text-gray-400 font-mono flex items-center justify-between select-none">
              <span>Registry v1.0.0</span>
              <span>Groq LLM</span>
            </div>
          </aside>

          {/* Right Chat Panel */}
          <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
            
            {/* Header Panel */}
            <div className="h-14 border-b border-gray-150 px-4 flex items-center justify-between bg-white select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-800">MCP Registry Assistant</span>
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <span>Groq Llama 3.3</span>
              </div>
            </div>

            {/* Chat Messages panel */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/20 scrollbar-thin select-text">
              {messages.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center px-4 select-none">
                  <div className="h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow mb-5">
                    <Sparkles className="h-5.5 w-5.5 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">
                    What MCP servers do you need?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Describe your agent workflows and I will recommend matching marketplace servers and generate standard JSON configs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-6 text-left">
                    {suggestionCards.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        className="p-3 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 rounded-xl transition text-left cursor-pointer shadow-sm focus:outline-none"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages rendering list */
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((message, idx) => {
                    const isLastMessage = idx === messages.length - 1;
                    const isStreamingActive = isLoading && isLastMessage && message.role === "assistant";

                    return (
                      <div
                        key={idx}
                        className={`flex gap-4 items-start ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="h-7 w-7 shrink-0 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 shadow-sm select-none">
                            <Sparkles className="h-3.5 w-3.5 text-gray-800" />
                          </div>
                        )}

                        <div className="max-w-[85%] overflow-hidden">
                          {message.role === "user" ? (
                            <div className="bg-gray-100 border border-gray-200/50 text-gray-800 rounded-2xl px-4 py-2.5 text-sm shadow-sm select-text">
                              {message.content}
                            </div>
                          ) : (
                            <div className="text-gray-800 text-[14.5px] leading-relaxed select-text py-0.5">
                              {renderMessageContent(message.content, isStreamingActive)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {error && (
                    <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold max-w-3xl mx-auto flex flex-col gap-1">
                      <span>Error retrieving recommendation stream:</span>
                      <span className="font-normal text-red-600">{error}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Bar Form */}
            <div className="p-4 bg-white border-t border-gray-150 select-none">
              <div className="max-w-3xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-gray-300 transition pl-4 pr-12 py-2.5 flex items-center"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Describe what your AI agent needs to do..."
                    rows={1}
                    className="w-full bg-transparent resize-none text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed max-h-[120px] py-1"
                    style={{ height: "auto" }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 p-2 text-white hover:bg-gray-800 active:scale-95 transition disabled:opacity-25 disabled:hover:bg-gray-900 disabled:active:scale-100 flex items-center justify-center cursor-pointer shadow-sm"
                    title="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
                <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                  Assistant generates configuration parameters. Verify config snippets inside your desktop settings.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
