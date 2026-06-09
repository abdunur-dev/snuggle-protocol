"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Menu, 
  X, 
  Copy, 
  Check, 
  ArrowLeft 
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

// Custom code block component for ChatGPT style dark mode
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
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d0d0d] text-zinc-100 max-w-full font-sans">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2f2f2f] border-b border-zinc-800 text-xs text-zinc-400 select-none">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput("");
    setError(null);
    setSidebarOpen(false);
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
    // Splits text by bold (**text**) and inline code (`code`)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="bg-zinc-800 text-zinc-100 px-1.5 py-0.5 rounded font-mono text-xs border border-zinc-700/30">
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
            <ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-1.5 my-2 text-zinc-300">
              {currentList.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{renderFormattedText(item)}</li>
              ))}
            </ul>
          );
        } else {
          blocks.push(
            <ol key={`ol-${blocks.length}`} className="list-decimal pl-6 space-y-1.5 my-2 text-zinc-300">
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
          <p key={`p-${i}`} className="my-1 text-zinc-300 leading-relaxed break-words">
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
        <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse align-middle" />
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
                  <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse align-middle ml-1" />
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121] text-zinc-200 antialiased select-none font-sans">
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#171717] transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-800/40">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 rounded-lg border border-zinc-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-2 p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="p-2 border-b border-zinc-800/30">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded-md transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Sidebar Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-3.5 space-y-1 scrollbar-thin">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider px-3 mb-2">
            Recent Chats
          </div>
          {sessions.length === 0 ? (
            <div className="text-xs text-zinc-600 px-3 py-2 italic">
              No chat history
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setSidebarOpen(false);
                  setError(null);
                }}
                className={`group flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition select-none ${
                  activeSessionId === session.id 
                    ? "bg-[#212121] text-zinc-100" 
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                }`}
              >
                <span className="truncate pr-2">{session.title}</span>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition"
                  title="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/40 flex items-center justify-between text-xs text-zinc-500">
          <span>MCPHub Recommender</span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#212121]">
        
        {/* Top Header Mobile */}
        <header className="flex h-14 items-center justify-between px-4 border-b border-zinc-800/40 bg-[#212121] text-zinc-200 md:hidden select-none">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <span className="text-sm font-medium">MCP Recommender</span>
          
          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        {/* Message Container Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin select-text">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-9rem)] md:min-h-full px-4 text-center">
              <div className="max-w-[720px] w-full flex flex-col items-center">
                
                {/* Clean minimalist logo wrapper */}
                <div className="h-12 w-12 rounded-xl bg-zinc-850 flex items-center justify-center text-zinc-200 shadow-lg border border-zinc-800 mb-6 select-none">
                  <Sparkles className="h-6 w-6" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-zinc-100 font-sans mb-8 select-none">
                  What MCP servers do you need?
                </h1>

                {/* Grid of suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[720px] text-left select-none">
                  {suggestionCards.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      disabled={isLoading}
                      className="px-4 py-3.5 rounded-xl border border-zinc-800 bg-[#2f2f2f]/30 hover:bg-[#2f2f2f]/50 text-sm text-zinc-300 hover:text-zinc-200 transition text-left cursor-pointer focus:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="w-full py-6 flex flex-col">
              {messages.map((message, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const isStreamingActive = isLoading && isLastMessage && message.role === "assistant";

                return (
                  <div
                    key={idx}
                    className={`w-full flex justify-center py-6 px-4 ${
                      message.role === "user" ? "" : "bg-[#212121]"
                    }`}
                  >
                    <div className="max-w-[760px] w-full flex gap-4 items-start">
                      
                      {/* Avatar container */}
                      {message.role === "assistant" ? (
                        <div className="h-8 w-8 shrink-0 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-300 shadow select-none">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      ) : (
                        // Hidden/placeholder for alignment block on right aligned user message
                        <div className="w-8 shrink-0 md:block hidden" />
                      )}

                      {/* Content panel */}
                      <div className="flex-1 overflow-hidden">
                        {message.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="bg-[#2F2F2F] text-[#ECECF1] rounded-2xl px-4 py-2.5 text-sm max-w-[85%] leading-relaxed select-text shadow-sm border border-zinc-800/10">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div className="text-zinc-300 text-[15px] leading-relaxed select-text">
                            {renderMessageContent(message.content, isStreamingActive)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Bottom error banner inside message area if needed */}
              {error && (
                <div className="w-full flex justify-center px-4 py-3">
                  <div className="max-w-[760px] w-full p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-sm flex flex-col gap-1">
                    <span className="font-semibold">Generation Error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Text Form Area */}
        <div className="w-full py-3 md:py-6 px-4 flex justify-center border-t border-zinc-800/10 bg-[#212121] select-none">
          <div className="max-w-[760px] w-full flex flex-col">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative rounded-2xl border border-zinc-800 bg-[#2f2f2f]/30 px-4 py-3 focus-within:border-zinc-700 transition"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Describe what your AI agent needs to do..."
                rows={1}
                className="w-full bg-transparent resize-none text-zinc-150 placeholder:text-zinc-500 focus:outline-none pr-12 text-sm leading-relaxed max-h-[200px]"
                style={{ height: "auto" }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 bottom-3 rounded-lg bg-zinc-200 p-1.5 text-zinc-900 hover:bg-zinc-100 active:scale-95 transition disabled:opacity-30 disabled:hover:bg-zinc-200 disabled:active:scale-100 flex items-center justify-center cursor-pointer shadow-md"
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              MCPHub chat assistant generates registry configurations. Verify installation commands and config structures.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
