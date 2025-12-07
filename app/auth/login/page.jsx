"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("204birdie@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("LOGIN ERROR:", error);
      setError(error.message || "Login failed.");
      return;
    }

    // Login success
    router.push("/profile");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900/80 rounded-2xl p-8 shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Sketch → Sculpt Login
        </h1>
        <p className="text-sm text-slate-400 mb-6 text-center">
          Sign in to manage your profile, avatar, and drawings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 mt-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="hover:text-sky-300 underline underline-offset-4"
          >
            Need an account? Sign up
          </button>

          <span className="text-xs italic">
            Forgot password link coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
