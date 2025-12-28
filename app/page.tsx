import Link from "next/link";

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 13,
  opacity: 0.9,
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px 60px" }}>
      {/* HERO */}
      <section
        style={{
          marginTop: 18,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "radial-gradient(1200px 500px at 15% 0%, rgba(120,180,255,0.18), rgba(0,0,0,0) 55%), radial-gradient(900px 500px at 80% 10%, rgba(255,120,200,0.10), rgba(0,0,0,0) 55%), rgba(255,255,255,0.02)",
          boxShadow: "0 10px 60px rgba(0,0,0,0.55)",
          padding: 22,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
          {/* Left */}
          <div style={{ padding: 8 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={chipStyle}>
                <Icon>✏️</Icon> Sketch → Refine → Render → Sculpt
              </span>
              <span style={chipStyle}>
                <Icon>🧠</Icon> AI tools, versioned
              </span>
              <span style={chipStyle}>
                <Icon>🧱</Icon> Built for real makers
              </span>
            </div>

            <h1 style={{ fontSize: 54, lineHeight: 1.02, margin: "18px 0 10px" }}>
              Turn sketches into{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, rgba(160,220,255,1), rgba(255,170,220,1))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                creations
              </span>
              .
            </h1>

            <p style={{ fontSize: 18, opacity: 0.82, margin: 0, maxWidth: 720 }}>
              Upload your drawing. Refine it with AI tools. Generate a 3D render preview. Keep versions.
              When you’re ready, move toward a physical sculpt.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <Link
                href="/gallery"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Get started
              </Link>

              <Link
                href="/gallery"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  textDecoration: "none",
                  opacity: 0.92,
                }}
              >
                View gallery
              </Link>

              <Link
                href="/login"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  textDecoration: "none",
                  opacity: 0.92,
                }}
              >
                Login
              </Link>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 18, flexWrap: "wrap", opacity: 0.75, fontSize: 13 }}>
              <span>✅ Version history</span>
              <span>✅ Compare stages</span>
              <span>✅ Artist notes + presets</span>
            </div>
          </div>

          {/* Right: a mock “pipeline preview” card */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.45)",
              padding: 14,
              display: "grid",
              gap: 10,
              alignContent: "start",
            }}
          >
            <div style={{ fontWeight: 800, opacity: 0.9 }}>Pipeline preview</div>

            {[
              { t: "Original", d: "Your raw sketch upload", badge: "v1" },
              { t: "Refined", d: "Cleaned lines, boosted contrast", badge: "v2" },
              { t: "3D Render", d: "Material + lighting preview", badge: "v1" },
              { t: "Sculpt", d: "Next: sculpt tools + print path", badge: "soon" },
            ].map((x) => (
              <div
                key={x.t}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{x.t}</div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{x.d}</div>
                </div>
                <div
                  style={{
                    alignSelf: "start",
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 12,
                    opacity: 0.9,
                    whiteSpace: "nowrap",
                  }}
                >
                  {x.badge}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>
              This panel is just UI polish. Your real pipeline is already running in Gallery.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ marginTop: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {[
            {
              icon: "🧼",
              title: "Refine like a pro",
              text: "Presets + custom prompts. Clean edges, remove noise, keep intent. Versions included.",
            },
            {
              icon: "🛠️",
              title: "Controls that matter",
              text: "Material, lighting, camera, detail. Generate variations without wrecking your original.",
            },
            {
              icon: "📦",
              title: "Built to ship",
              text: "This isn’t art cosplay. It’s designed to become a real object with a real production path.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.02)",
                padding: 16,
                boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Icon>{f.icon}</Icon>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{f.title}</div>
              </div>
              <div style={{ marginTop: 10, opacity: 0.78, lineHeight: 1.5 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section
        style={{
          marginTop: 22,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.02)",
          padding: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Ready to run your first piece through?</div>
          <div style={{ opacity: 0.75, marginTop: 6, fontSize: 14 }}>
            Upload an original, refine it, generate a 3D render, and save versions.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/gallery"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Open Gallery
          </Link>
          <Link
            href="/login"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </section>

      <footer style={{ marginTop: 36, opacity: 0.65, fontSize: 13 }}>
        © {new Date().getFullYear()} Sketch→Sculpt
      </footer>
    </main>
  );
}
