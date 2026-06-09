import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Boxes, LogOut } from "lucide-react";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30 group-hover:bg-primary/25 transition">
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">MCPHub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/browse" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Browse</Link>
          <Link to="/submit" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Submit</Link>
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition">Docs</a>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate">{email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
              Sign in
            </Link>
          )}
          <Link
            to="/submit"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_8px_24px_-8px_rgba(59,130,246,0.6)]"
          >
            Submit Server
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-primary" />
          <span>MCPHub — Marketplace for the Model Context Protocol</span>
        </div>
        <div className="flex gap-5">
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="hover:text-foreground">MCP Spec</a>
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <Link to="/submit" className="hover:text-foreground">Submit</Link>
        </div>
      </div>
    </footer>
  );
}
