import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ServerCard, ServerCardSkeleton, type ServerRow } from "@/components/server-card";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/categories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MCPHub — The MCP Server Marketplace for AI Agents" },
      { name: "description", content: "Browse, search, and submit MCP servers. The directory for the Model Context Protocol ecosystem." },
      { property: "og:title", content: "MCPHub — MCP Server Marketplace" },
      { property: "og:description", content: "Browse, search, and submit MCP servers for AI agents." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["featured-servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_servers")
        .select("id,name,slug,description,category,github_url,install_count,star_rating")
        .eq("approved", true)
        .order("install_count", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as ServerRow[];
    },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: query || undefined, cat: undefined } as never });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Open marketplace for the Model Context Protocol
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight">
            The MCP Server Marketplace
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              for AI Agents
            </span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Discover and ship MCP servers that give your AI agents real-world tools. Browse hundreds of integrations, or publish your own in minutes.
          </p>

          <form onSubmit={onSearch} className="mt-8 mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search servers by name or category…"
                className="w-full rounded-xl border border-border bg-card pl-11 pr-32 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <Link
                  key={c}
                  to="/browse"
                  search={{ cat: c, q: undefined } as never}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs hover:border-primary/50 hover:text-primary transition"
                >
                  <Icon className="h-3 w-3" /> {c}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trending servers</h2>
            <p className="text-sm text-muted-foreground mt-1">Most-installed MCP servers this week.</p>
          </div>
          <Link to="/browse" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServerCardSkeleton key={i} />)
            : data?.map((s) => <ServerCard key={s.id} s={s} />)}
        </div>
      </section>

      <div className="flex-1" />
      <SiteFooter />
    </div>
  );
}
