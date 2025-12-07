"use client";

import { useState } from "react";
import supabase from "../../lib/supabaseClient";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${APP_URL}/auth/update-password`,
        });

      if (resetError) throw resetError;

      setMessage(
        "If that email exists, we sent a reset link. Check your inbox."
      );
    } catch (err) {
      console.error("reset error:", err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-md mx-auto mt-16 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <p className="text-xs tracking-wide text-sky-400 uppercase">
          Sketch → Sculpt
        </p>
        <h1 className="mt-1 text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-xs text-slate-400">
          Enter your account email and we&apos;ll send you a reset link.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-emerald-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => (window.location.href = "/auth/login")}
          className="mt-4 text-xs font-medium text-sky-400 hover:text-sky-300"
        >
          Back to login
        </button>
      </div>
    </main>
  );
}
