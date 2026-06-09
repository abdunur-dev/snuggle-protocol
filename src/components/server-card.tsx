import { Link } from "@tanstack/react-router";
import { Github, Star, Download } from "lucide-react";
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

export function ServerCard({ s }: { s: ServerRow }) {
  const Icon = CATEGORY_ICONS[s.category as Category] ?? CATEGORY_ICONS.Communication;
  return (
    <Link
      to="/servers/$slug"
      params={{ slug: s.slug }}
      className="group relative flex flex-col rounded-xl border border-border/70 bg-card p-5 transition hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight group-hover:text-primary transition">{s.name}</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.category}</span>
          </div>
        </div>
        <a
          href={s.github_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{s.description}</p>
      <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{formatCount(s.install_count)}</span>
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{s.star_rating.toFixed(1)}</span>
      </div>
    </Link>
  );
}

export function ServerCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-2 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-4/5 rounded bg-muted" />
      </div>
      <div className="mt-5 h-2 w-32 rounded bg-muted" />
    </div>
  );
}
