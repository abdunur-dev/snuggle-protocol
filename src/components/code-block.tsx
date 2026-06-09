import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="relative group rounded-lg border border-border bg-[oklch(0.13_0.012_250)] overflow-hidden">
      {language && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs hover:bg-accent transition opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? <><Check className="h-3 w-3 text-green-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
    </div>
  );
}
