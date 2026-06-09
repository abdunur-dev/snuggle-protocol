"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! You can now submit servers.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully");
      }
      router.push("/submit");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-[#fafafa]">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white font-bold group-hover:bg-gray-800 transition">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">MCPHub</span>
        </Link>
        
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/50">
          <h1 className="text-2xl font-bold font-display text-gray-900">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
            {mode === "signin"
              ? "Sign in to manage and submit MCP servers."
              : "Create a free developer account to submit servers."}
          </p>
          
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition shadow-sm"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gray-950 px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 shadow-md hover:shadow-lg mt-2"
            >
              {loading ? "Authenticating..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm font-medium text-gray-500 hover:text-gray-900 w-full text-center block transition"
          >
            {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
