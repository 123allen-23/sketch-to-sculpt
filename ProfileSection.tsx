import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProfileSection() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const u = authData.user;
      setUser(u);

      if (u?.user_metadata) {
        setData({
          full_name: u.user_metadata.full_name || "",
          username: u.user_metadata.username || "",
          bio: u.user_metadata.bio || "",
          avatar_url: u.user_metadata.avatar_url || ""
        });
      }
    };

    loadUser();
  }, []);

  const updateUser = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio,
        avatar_url: data.avatar_url
      }
    });
    setSaving(false);
    if (error) alert(error.message);
    else alert("Profile updated!");
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) return alert(error.message);

    const { data: urlData } = supabase
      .storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    setData({ ...data, avatar_url: publicUrl });
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "2rem auto" }}>
      <h2>Your Profile</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Full Name</label>
        <input
          style={{ width: "100%" }}
          value={data.full_name}
          onChange={(e) =>
            setData({ ...data, full_name: e.target.value })
          }
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Username</label>
        <input
          style={{ width: "100%" }}
          value={data.username}
          onChange={(e) =>
            setData({ ...data, username: e.target.value })
          }
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Bio</label>
        <textarea
          style={{ width: "100%" }}
          rows={3}
          value={data.bio}
          onChange={(e) =>
            setData({ ...data, bio: e.target.value })
          }
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Avatar</label>
        <input type="file" accept="image/*" onChange={handleAvatar} />

        {data.avatar_url && (
          <img
            src={data.avatar_url}
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              marginTop: 10,
              objectFit: "cover",
            }}
          />
        )}
      </div>

      <button
        onClick={updateUser}
        disabled={saving}
        style={{
          padding: "8px 16px",
          borderRadius: 12,
          cursor: "pointer",
          background: "#222",
          color: "#fff",
        }}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
