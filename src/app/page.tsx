"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Sparkles, ArrowRight, Download, Play, Shield, Cpu, Terminal, Database } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ServerCard, ServerCardSkeleton, type ServerRow } from "@/components/server-card";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/categories";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const MOCK_CHART_DATA = [
  { name: "Mon", calls: 4200 },
  { name: "Tue", calls: 5800 },
  { name: "Wed", calls: 8400 },
  { name: "Thu", calls: 7100 },
  { name: "Fri", calls: 9200 },
  { name: "Sat", calls: 6300 },
  { name: "Sun", calls: 7800 },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data: featuredServers, isLoading } = useQuery({
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
    router.push(`/browse?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      {/* Decorative Forest Elements (Minimalist SVG Pine Trees like Vectra) */}
      <div className="absolute left-0 top-36 w-64 h-96 opacity-10 pointer-events-none hidden xl:block select-none">
        <svg viewBox="0 0 100 200" className="w-full h-full text-emerald-950 fill-current">
          <path d="M 50 10 L 25 60 L 40 60 L 15 110 L 45 110 L 10 160 L 90 160 L 55 110 L 85 110 L 60 60 L 75 60 Z" />
          <path d="M 50 160 L 50 190 L 55 190 L 55 160 Z" />
          <path d="M 30 50 L 15 90 L 25 90 L 5 130 L 30 130 L 0 170 L 60 170 L 40 130 L 55 130 L 35 90 L 45 90 Z" opacity="0.6" />
        </svg>
      </div>
      <div className="absolute right-0 top-36 w-64 h-96 opacity-10 pointer-events-none hidden xl:block select-none">
        <svg viewBox="0 0 100 200" className="w-full h-full text-emerald-950 fill-current transform scale-x-[-1]">
          <path d="M 50 10 L 25 60 L 40 60 L 15 110 L 45 110 L 10 160 L 90 160 L 55 110 L 85 110 L 60 60 L 75 60 Z" />
          <path d="M 50 160 L 50 190 L 55 190 L 55 160 Z" />
          <path d="M 30 50 L 15 90 L 25 90 L 5 130 L 30 130 L 0 170 L 60 170 L 40 130 L 55 130 L 35 90 L 45 90 Z" opacity="0.6" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3 py-1 text-xs text-gray-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-gray-900 fill-gray-900" />
              <span>The Marketplace for AI Capabilities</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold font-display tracking-tight text-gray-900 leading-[1.05]">
              Integrations That Drive Better <span className="font-serif italic font-normal text-gray-800">AI Outcomes</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Equip your AI agents with real-world databases, APIs, and tools. Discover open-source Model Context Protocol (MCP) servers or publish yours to the registry in seconds.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/browse"
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Discover Now &rarr;
              </Link>
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Learn More
              </a>
            </div>

            {/* Inline search */}
            <form onSubmit={onSearch} className="mt-8 mx-auto max-w-lg relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search servers by name, tools or category..."
                  className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-32 py-4 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Vectra-Style Floating Dashboard Card */}
          <div className="mt-16 max-w-4xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats / Dashboard Summary */}
                <div className="space-y-6 md:border-r md:border-gray-100 md:pr-8">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total API Operations</span>
                    <h3 className="text-3xl font-bold font-display text-gray-900 mt-1">48,720</h3>
                    <span className="text-xs text-green-600 font-medium inline-flex items-center gap-0.5 mt-1">
                      +12.4% this week
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Registry Health</span>
                      <span className="font-medium text-gray-900">99.98%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full" style={{ width: "99.98%" }} />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-gray-900">Active Handlers</span>
                    <div className="flex gap-2">
                      <span className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center" title="PostgreSQL"><Database className="h-4 w-4 text-gray-600" /></span>
                      <span className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center" title="Code Compiler"><Cpu className="h-4 w-4 text-gray-600" /></span>
                      <span className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center" title="Security sandbox"><Shield className="h-4 w-4 text-gray-600" /></span>
                    </div>
                  </div>
                </div>

                {/* Graph preview */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Weekly Activity</h4>
                      <p className="text-xs text-gray-400">Number of requests dispatched through registered MCP servers</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">Calls/day</span>
                  </div>

                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_CHART_DATA}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={30} />
                        <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                        <Bar dataKey="calls" fill="#111827" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="border-y border-gray-200/50 bg-white/50 backdrop-blur py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar justify-start md:justify-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Explore:</span>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <Link
                  key={c}
                  href={`/browse?cat=${encodeURIComponent(c)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white px-3.5 py-1.5 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                  <span>{c}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured / Trending */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-gray-900">Trending Servers</h2>
            <p className="text-sm text-gray-400 mt-1">High quality, verified integrations ready to deploy.</p>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline"
          >
            <span>View all servers</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServerCardSkeleton key={i} />)
            : featuredServers?.map((s) => <ServerCard key={s.id} s={s} />)}
        </div>
      </section>
    </div>
  );
}
