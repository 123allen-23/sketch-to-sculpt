"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check that we actually have a valid session from the reset link
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        console.error("getUser error:", error);
        setError(
          "This reset link is invalid or expired. Try requesting a new one."
        );
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("Password updated. You can now sign in.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1200);
    } catch (err) {
      console.error("update password error:", err);
      setError(err.message || "Failed to update password.");
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
        <h1 className="mt-1 text-2xl font-bold">Choose a new password</h1>
        <p className="mt-1 text-xs text-slate-400">
          This page only works from the link we emailed you.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-300">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Repeat password"
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
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
