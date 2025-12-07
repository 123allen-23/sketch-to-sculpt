import React, { useState } from "react";

type SettingsForm = {
  displayName: string;
  username: string;
  bio: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    displayName: "",
    username: "",
    bio: "",
    theme: "system",
    emailNotifications: true,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // later we'll hook this to Supabase
    console.log("Saving settings:", form);
    alert("Settings saved (mock).");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-slate-400 mb-6">
        Update your profile and app preferences.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile */}
        <section>
          <h2 className="text-lg font-medium mb-3">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="displayName">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 min-h-[80px]"
                placeholder="Tell people about your art or style..."
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-lg font-medium mb-3">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="theme">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                value={form.theme}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2"
              >
                <option value="system">Match device</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={form.emailNotifications}
                onChange={handleChange}
              />
              <span>Email me about order updates and important changes</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-900 font-medium"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
