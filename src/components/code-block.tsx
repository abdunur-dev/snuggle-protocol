"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ 
  code, 
  language,
  onCopy 
}: { 
  code: string; 
  language?: string; 
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onCopy?.();
    } catch {}
  };
  return (
    <div className="relative group rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {language && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
          <span>{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-gray-800" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-sm"
      >
        {copied ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
    </div>
  );
}

