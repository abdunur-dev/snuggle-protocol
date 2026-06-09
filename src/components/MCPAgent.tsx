"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export function MCPAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am the **MCP Recommender Agent**.\n\nDescribe what you want your AI agent to do (e.g., *'I want to send Slack messages and manage events in Google Calendar'*), and I will recommend the right servers and generate a combined configuration snippet for you!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    setInputValue("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error("[MCPAgent] Error querying API route:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all duration-200 shadow-xl flex items-center justify-center text-white cursor-pointer border border-blue-500/10"
        title="Ask MCP Recommender Agent"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-2xl border border-gray-800 bg-[#0c0f16] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#121824] px-4 py-3.5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-4 w-4 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100 font-display">MCP Agent</h3>
              <p className="text-[10px] text-gray-500 font-medium">Powered by Gemini 2.0</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0d14] scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-[#181e2b] text-gray-200 rounded-bl-none border border-gray-800/60"
                }`}
              >
                {/* Custom segments rendering to handle text + code blocks inside chat */}
                {parseMarkdown(m.content).map((segment, segIdx) => {
                  if (segment.type === "code") {
                    return (
                      <div key={segIdx} className="my-2.5 text-left w-full overflow-hidden">
                        <CodeBlock
                          code={segment.content}
                          language={segment.language || "json"}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={segIdx} className="whitespace-pre-wrap">
                        {segment.content.split("\n").map((line, lineIdx) => {
                          // Very basic bold text parser for **text**
                          const parts = line.split(/\*\*/);
                          const renderedLine = parts.map((part, partIdx) =>
                            partIdx % 2 === 1 ? <strong key={partIdx} className="font-semibold text-white">{part}</strong> : part
                          );
                          return <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>{renderedLine}</p>;
                        })}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-[#181e2b] border border-gray-800/60 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3.5 shadow-sm flex items-center gap-1.5">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-gray-800 bg-[#0c0f16] flex gap-2"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Describe what your AI agent needs to do..."
            className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-500 active:scale-95 transition disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
