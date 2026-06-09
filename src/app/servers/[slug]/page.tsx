"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Download, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CodeBlock } from "@/components/code-block";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function ServerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["server", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_servers")
        .select("*")
        .eq("slug", slug)
        .eq("approved", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("not_found");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-100 rounded" />
          <div className="mt-8 h-14 w-14 bg-gray-100 rounded-xl" />
          <div className="h-10 w-2/3 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-4/5 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    if (error?.message === "not_found") {
      notFound();
    }
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900">Failed to load server</h2>
        <p className="text-sm text-gray-400 mt-1">Please check your network or try again.</p>
        <Link href="/browse" className="mt-4 rounded-full bg-gray-950 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition">
          Back to Browse
        </Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[data.category as Category] ?? CATEGORY_ICONS.Communication;
  let prettyConfig = data.config_snippet;
  try {
    prettyConfig = JSON.stringify(JSON.parse(data.config_snippet), null, 2);
  } catch {}

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition">
        <ArrowLeft className="h-3.5 w-3.5" /> All servers
      </Link>

      <div className="mt-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 shrink-0">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-gray-900">{data.name}</h1>
            <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-500 font-semibold">{data.category}</span>
          </div>
          <p className="mt-3 text-base text-gray-500 leading-relaxed max-w-2xl">{data.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5"><Download className="h-4 w-4" />{data.install_count.toLocaleString()} installs</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{Number(data.star_rating).toFixed(1)} rating</span>
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{data.author_name}</span>
            <a href={data.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-900 transition font-medium">
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Install Command</h2>
        <CodeBlock code={data.install_command} language="bash" />
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Agent Configuration</h2>
        <p className="text-sm text-gray-400 mb-3">Add this block to your MCP client configuration file (e.g. <code className="text-gray-950 font-semibold">claude_desktop_config.json</code>).</p>
        <CodeBlock code={prettyConfig} language="json" />
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Source Repository</h2>
        <a
          href={data.github_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition shadow-sm"
        >
          <GithubIcon className="h-4 w-4" />
          <span className="font-semibold">{data.github_url.replace("https://", "")}</span>
        </a>
      </section>
    </div>
  );
}
