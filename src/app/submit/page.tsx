"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SubmitPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0] as string,
    github_url: "",
    install_command: "",
    config_snippet: "",
    author_name: "",
    author_email: "",
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
    if (!userId) {
      router.push("/login");
      return;
    }
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
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12 flex-1">
      <h1 className="text-4xl font-bold font-display tracking-tight text-gray-900">Submit an MCP Server</h1>
      <p className="text-gray-400 mt-2">
        Share your integration with the community. Submissions are reviewed before going live.
      </p>

      {checking ? (
        <div className="mt-8 flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full" />
        </div>
      ) : !userId ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">You need an account to submit a server to the registry.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            <span>Sign in to continue</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : success ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-950" />
          <h2 className="mt-4 text-xl font-bold font-display text-gray-900">Submission received</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Thank you! Your server is queued for review and will appear in the directory once approved by our team.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/browse"
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Browse servers
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  description: "",
                  category: CATEGORIES[0],
                  github_url: "",
                  install_command: "",
                  config_snippet: "",
                  author_name: "",
                  author_email: "",
                });
              }}
              className="rounded-full bg-gray-950 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            >
              Submit another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <Field label="Name" required>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="My MCP Server"
            />
          </Field>
          
          <Field label="Description" required>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputCls}
              placeholder="What tools does this server expose and what APIs does it integrate?"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Category" required>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GitHub URL" required>
              <input
                required
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className={inputCls}
                placeholder="https://github.com/username/repo"
              />
            </Field>
          </div>

          <Field label="Install Command" required>
            <input
              required
              value={form.install_command}
              onChange={(e) => setForm({ ...form, install_command: e.target.value })}
              className={`${inputCls} font-mono text-xs`}
              placeholder="npx -y my-mcp-server"
            />
          </Field>

          <Field label="Client Config Snippet (JSON)" required>
            <textarea
              required
              rows={6}
              value={form.config_snippet}
              onChange={(e) => setForm({ ...form, config_snippet: e.target.value })}
              className={`${inputCls} font-mono text-xs`}
              placeholder={`{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Author Name" required>
              <input
                required
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className={inputCls}
                placeholder="Your name"
              />
            </Field>
            <Field label="Author Email" required>
              <input
                required
                type="email"
                value={form.author_email}
                onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                className={inputCls}
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 shadow-md hover:shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm cursor-text";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {label}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}
