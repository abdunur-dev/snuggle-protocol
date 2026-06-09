import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Search, SearchX } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ServerCard, ServerCardSkeleton, type ServerRow } from "@/components/server-card";
import { CATEGORIES } from "@/lib/categories";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
});

type Sort = "newest" | "installs" | "rating";

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse MCP Servers — MCPHub" },
      { name: "description", content: "Browse and filter all available MCP servers by category, popularity, or rating." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(search.q ?? "");
  const [sort, setSort] = useState<Sort>("installs");

  useEffect(() => { setQuery(search.q ?? ""); }, [search.q]);

  const { data, isLoading } = useQuery({
    queryKey: ["servers", search.cat ?? "all", sort],
    queryFn: async () => {
      let q = supabase
        .from("mcp_servers")
        .select("id,name,slug,description,category,github_url,install_count,star_rating")
        .eq("approved", true);
      if (search.cat) q = q.eq("category", search.cat);
      if (sort === "newest") q = q.order("created_at", { ascending: false });
      else if (sort === "rating") q = q.order("star_rating", { ascending: false });
      else q = q.order("install_count", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as ServerRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = (search.q ?? "").toLowerCase().trim();
    if (!term) return data;
    return data.filter(
      (s) => s.name.toLowerCase().includes(term) || s.description.toLowerCase().includes(term) || s.category.toLowerCase().includes(term),
    );
  }, [data, search.q]);

  const updateSearch = (next: Partial<{ q: string | undefined; cat: string | undefined }>) => {
    navigate({ search: { ...search, ...next } as never, replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <h1 className="text-3xl font-bold tracking-tight">Browse MCP Servers</h1>
        <p className="text-muted-foreground mt-1">Every approved server in the registry.</p>

        <div className="mt-6 flex flex-col lg:flex-row gap-3">
          <form
            onSubmit={(e) => { e.preventDefault(); updateSearch({ q: query || undefined }); }}
            className="relative flex-1"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, description, or category…"
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="installs">Most installed</option>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => updateSearch({ cat: undefined })}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              !search.cat ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updateSearch({ cat: search.cat === c ? undefined : c })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                search.cat === c ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServerCardSkeleton key={i} />)
            : filtered.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <SearchX className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold">No servers found</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Try a different search term or clear the category filter.
                  </p>
                </div>
              )
              : filtered.map((s) => <ServerCard key={s.id} s={s} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
