import { useState, useEffect } from "react";
// import { supabase } from "../lib/supabaseClient"; // <-- use your path

type SettingsForm = {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    displayName: "",
    username: "",
    bio: "",
    email: "",
    theme: "system",
    emailNotifications: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // TODO: load user + profile from Supabase on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setMessage(null);

        // 1) Get current user
        // const {
        //   data: { user },
        //   error: userError,
        // } = await supabase.auth.getUser();
        // if (userError || !user) throw userError || new Error("No user");

        // 2) Pull profile row
        // const { data: profile, error: profileError } = await supabase
        //   .from("profiles")
        //   .select("display_name, username, bio, theme, email_notifications")
        //   .eq("id", user.id)
        //   .single();
        // if (profileError) throw profileError;

        // TEMP: mock data until you wire Supabase
        const user = { email: "test@example.com" };
        const profile = {
          display_name: "Capn",
          username: "capn-art",
          bio: "Turning sketches into sculptures.",
          theme: "system",
          email_notifications: true,
        };

        setForm({
          displayName: profile.display_name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          email: user.email || "",
          theme: (profile.theme as SettingsForm["theme"]) || "system",
          emailNotifications: !!profile.email_notifications,
        });
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // const {
      //   data: { user },
      //   error: userError,
      // } = await supabase.auth.getUser();
      // if (userError || !user) throw userError || new Error("No user");

      // const { error: updateError } = await supabase
      //   .from("profiles")
      //   .update({
      //     display_name: form.displayName,
      //     username: form.username,
      //     bio: form.bio,
      //     theme: form.theme,
      //     email_notifications: form.emailNotifications,
      //   })
      //   .eq("id", user.id);

      // if (updateError) throw updateError;

      setMessage("Settings saved ✅");
    } catch (err: any) {
      console.error(err);
      setMessage("Could not save settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Update your profile, account details, and app preferences.
      </p>

      {message && (
        <div className="mb-4 text-sm">
          {message}
        </div>
      )}

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
                className="w-full rounded-md border px-3 py-2"
                placeholder="How you appear in the app"
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
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g. sketchtosculpt"
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
                className="w-full rounded-md border px-3 py-2 min-h-[80px]"
                placeholder="Tell people about your art or style..."
              />
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 className="text-lg font-medium mb-3">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                disabled
                className="w-full rounded-md border px-3 py-2 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email comes from your login account.
              </p>
            </div>

            <button
              type="button"
              className="text-sm underline"
              // onClick={() => navigate("/change-password")} // if you add a route
            >
              Change password
            </button>
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
                className="w-full rounded-md border px-3 py-2"
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-md border"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
