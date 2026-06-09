"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, Suspense } from "react";
import { Search, SearchX } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ServerCard, ServerCardSkeleton, type ServerRow } from "@/components/server-card";
import { CATEGORIES } from "@/lib/categories";

type Sort = "newest" | "installs" | "rating";

function BrowseContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qParam = searchParams.get("q") || "";
  const catParam = searchParams.get("cat") || "";

  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState<Sort>("installs");

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const { data, isLoading } = useQuery({
    queryKey: ["servers", catParam || "all", sort],
    queryFn: async () => {
      try {
        let q = supabase
          .from("mcp_servers")
          .select("id,name,slug,description,category,github_url,install_count,star_rating")
          .eq("approved", true);
        
        if (catParam) {
          q = q.eq("category", catParam);
        }
        
        if (sort === "newest") {
          q = q.order("created_at", { ascending: false });
        } else if (sort === "rating") {
          q = q.order("star_rating", { ascending: false });
        } else {
          q = q.order("install_count", { ascending: false });
        }
        
        const { data, error } = await q;
        if (error || !data || data.length === 0) {
          const { FALLBACK_SERVERS } = await import("@/lib/supabase/fallback-data");
          let result = [...FALLBACK_SERVERS];
          if (catParam) {
            result = result.filter(s => s.category === catParam);
          }
          if (sort === "newest") {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (sort === "rating") {
            result.sort((a, b) => b.star_rating - a.star_rating);
          } else {
            result.sort((a, b) => b.install_count - a.install_count);
          }
          return result as unknown as ServerRow[];
        }
        return data as ServerRow[];
      } catch (err) {
        console.warn("Failed to fetch mcp_servers from Supabase, using local fallback data:", err);
        const { FALLBACK_SERVERS } = await import("@/lib/supabase/fallback-data");
        let result = [...FALLBACK_SERVERS];
        if (catParam) {
          result = result.filter(s => s.category === catParam);
        }
        if (sort === "newest") {
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === "rating") {
          result.sort((a, b) => b.star_rating - a.star_rating);
        } else {
          result.sort((a, b) => b.install_count - a.install_count);
        }
        return result as unknown as ServerRow[];
      }
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = qParam.toLowerCase().trim();
    if (!term) return data;
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
    );
  }, [data, qParam]);

  const updateSearch = (next: { q?: string; cat?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (next.hasOwnProperty("q")) {
      if (next.q) {
        params.set("q", next.q);
      } else {
        params.delete("q");
      }
    }
    
    if (next.hasOwnProperty("cat")) {
      if (next.cat) {
        params.set("cat", next.cat);
      } else {
        params.delete("cat");
      }
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-gray-900">Browse MCP Servers</h1>
          <p className="text-gray-400 mt-1">Every approved server in the marketplace registry.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col lg:flex-row gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateSearch({ q: query });
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description, or tools..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm"
          />
        </form>
        
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm cursor-pointer"
        >
          <option value="installs">Most installed</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Categories Row */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => updateSearch({ cat: "" })}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
            !catParam
              ? "border-gray-950 bg-gray-950 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => updateSearch({ cat: catParam === c ? "" : c })}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              catParam === c
                ? "border-gray-950 bg-gray-950 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ServerCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-3xl bg-white">
            <SearchX className="h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">No servers found</h3>
            <p className="mt-1 text-sm text-gray-400 max-w-sm">
              Try adjusting your query or resetting the category filter.
            </p>
          </div>
        ) : (
          filtered.map((s) => <ServerCard key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-100 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-50 border border-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
