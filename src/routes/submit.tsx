import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit an MCP Server — MCPHub" },
      { name: "description", content: "Submit your MCP server to the MCPHub directory." },
    ],
  }),
  component: SubmitPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SubmitPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: CATEGORIES[0] as string,
    github_url: "", install_command: "", config_snippet: "",
    author_name: "", author_email: "",
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setChecking(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { navigate({ to: "/login" }); return; }
    setSubmitting(true);
    const slug = slugify(form.name);
    const { error } = await supabase.from("mcp_servers").insert({
      ...form,
      slug,
      approved: false,
      submitted_by: userId,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <h1 className="text-3xl font-bold tracking-tight">Submit an MCP server</h1>
        <p className="text-muted-foreground mt-2">
          Share your server with the community. Submissions are reviewed before going live.
        </p>

        {checking ? null : !userId ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">You need an account to submit a server.</p>
            <Link to="/login" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Sign in to continue
            </Link>
          </div>
        ) : success ? (
          <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-3 text-xl font-semibold">Submission received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks! Your server is queued for review and will appear in the directory once approved.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link to="/browse" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">Browse servers</Link>
              <button
                onClick={() => { setSuccess(false); setForm({ name: "", description: "", category: CATEGORIES[0], github_url: "", install_command: "", config_snippet: "", author_name: "", author_email: "" }); }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Name" required>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="My MCP Server" />
            </Field>
            <Field label="Description" required>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="What does it do?" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Category" required>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="GitHub URL" required>
                <input required type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={inputCls} placeholder="https://github.com/…" />
              </Field>
            </div>
            <Field label="Install command" required>
              <input required value={form.install_command} onChange={(e) => setForm({ ...form, install_command: e.target.value })} className={`${inputCls} font-mono text-xs`} placeholder="npx -y my-mcp-server" />
            </Field>
            <Field label="Config snippet (JSON)" required>
              <textarea required rows={6} value={form.config_snippet} onChange={(e) => setForm({ ...form, config_snippet: e.target.value })} className={`${inputCls} font-mono text-xs`} placeholder='{"mcpServers":{"my":{"command":"npx","args":["-y","my-mcp-server"]}}}' />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Author name" required>
                <input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Author email" required>
                <input required type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}{required && " *"}</span>
      {children}
    </label>
  );
}
