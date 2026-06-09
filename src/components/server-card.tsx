"use client";

import Link from "next/link";
import { Star, Download } from "lucide-react";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

export interface ServerRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  github_url: string;
  install_count: number;
  star_rating: number;
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

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

export function ServerCard({ s }: { s: ServerRow }) {
  const Icon = CATEGORY_ICONS[s.category as Category] ?? CATEGORY_ICONS.Communication;
  return (
    <Link
      href={`/servers/${s.slug}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-gray-200/60">
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 tracking-tight group-hover:text-black transition">{s.name}</h3>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">{s.category}</span>
          </div>
        </div>
        <a
          href={s.github_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-700 transition"
          aria-label="GitHub"
        >
          <GithubIcon className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
      <div className="mt-5 flex items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{formatCount(s.install_count)}</span>
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{s.star_rating.toFixed(1)}</span>
      </div>
    </Link>
  );
}

export function ServerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gray-100" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-2 w-16 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 w-full rounded bg-gray-100" />
        <div className="h-2 w-4/5 rounded bg-gray-100" />
      </div>
      <div className="mt-5 h-2 w-32 rounded bg-gray-100" />
    </div>
  );
}
