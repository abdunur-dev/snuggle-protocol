"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LogOut, Menu, X } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (pathname === "/chat") return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/chat", label: "Agent" },
    { href: "/submit", label: "Submit" },
    { href: "https://modelcontextprotocol.io", label: "Docs", external: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 group-hover:bg-gray-800 transition">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">MCPHub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 hover:text-gray-900 transition font-medium"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition ${
                  pathname === link.href
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-400 max-w-[140px] truncate">{email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
              Sign in
            </Link>
          )}
          <Link
            href="/submit"
            className="hidden sm:inline-flex rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900 font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm font-medium py-2 ${
                  pathname === link.href ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label
              }</Link>
            )
          )}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {!email && (
              <Link href="/login" className="text-sm font-medium text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
            <Link
              href="/submit"
              className="rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-gray-800 transition"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
