import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Github, Star, Download, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CodeBlock } from "@/components/code-block";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

export const Route = createFileRoute("/servers/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — MCPHub` },
      { name: "description", content: `Install and configure ${params.slug} for your AI agent.` },
    ],
  }),
  component: ServerDetail,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-destructive font-semibold">Failed to load server.</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-3xl font-bold">Server not found</h1>
        <Link to="/browse" className="text-primary mt-3 inline-block">Back to browse</Link>
      </div>
    </div>
  ),
});

function ServerDetail() {
  const { slug } = Route.useParams();
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
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-12 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="mt-8 h-10 w-2/3 bg-muted rounded" />
          <div className="mt-4 h-4 w-full bg-muted rounded" />
          <div className="mt-2 h-4 w-4/5 bg-muted rounded" />
        </div>
      </div>
    );
  }
  if (error || !data) return null;

  const Icon = CATEGORY_ICONS[data.category as Category] ?? CATEGORY_ICONS.Communication;
  let prettyConfig = data.config_snippet;
  try {
    prettyConfig = JSON.stringify(JSON.parse(data.config_snippet), null, 2);
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All servers
        </Link>

        <div className="mt-6 flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
              <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">{data.category}</span>
            </div>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">{data.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Download className="h-4 w-4" />{data.install_count.toLocaleString()} installs</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{Number(data.star_rating).toFixed(1)} rating</span>
              <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{data.author_name}</span>
              <a href={data.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Install</h2>
          <CodeBlock code={data.install_command} language="bash" />
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Agent configuration</h2>
          <p className="text-sm text-muted-foreground mb-3">Copy this snippet into your MCP client config (e.g. <code className="text-foreground">claude_desktop_config.json</code>).</p>
          <CodeBlock code={prettyConfig} language="json" />
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Repository</h2>
          <a
            href={data.github_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/50 hover:bg-card/80 transition"
          >
            <Github className="h-4 w-4" />
            <span className="font-medium">{data.github_url.replace("https://", "")}</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
