// app/layout.jsx

export const metadata = {
  title: "Sketch → Sculpt",
  description: "Turn your hand-drawn art into 3D sculptures.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
              background:
                "radial-gradient(circle at top left, #020617 0%, #020617 50%, #020617 100%)",
              position: "sticky",
              top: 0,
              zIndex: 20,
              boxShadow:
                "0 12px 30px rgba(15, 23, 42, 0.85), 0 0 0 1px rgba(56,189,248,0.08)",
            }}
          >
            <div
              style={{
                maxWidth: "1040px",
                margin: "0 auto",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                    color: "#38bdf8",
                  }}
                >
                  SKETCH → SCULPT
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#9ca3af",
                    marginTop: "2px",
                  }}
                >
                  From pencil sketch to gallery-ready piece.
                </div>
              </div>

              <nav
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  fontSize: "0.9rem",
                }}
              >
                <a style={navLinkStyle} href="/">
                  Home
                </a>
                <a style={navLinkStyle} href="/upload">
                  Upload
                </a>
                <a style={navLinkStyle} href="/gallery">
                  Gallery
                </a>
                <a style={navLinkStyle} href="/profile">
                  Profile
                </a>
                <a style={navLinkStyle} href="/settings">
                  Settings
                </a>
                <a style={navLinkStyle} href="/about">
                  About
                </a>
              </nav>
            </div>
          </header>

          <main
            style={{
              flex: "1 0 auto",
              maxWidth: "1040px",
              margin: "0 auto",
              padding: "20px 16px 32px",
            }}
          >
            {children}
          </main>

          <footer
            style={{
              borderTop: "1px solid rgba(148, 163, 184, 0.2)",
              padding: "16px",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#6b7280",
              background: "#020617",
            }}
          >
            © {new Date().getFullYear()} Sketch → Sculpt · Pencil to sculpture,
            one piece at a time.
          </footer>
        </div>
      </body>
    </html>
  );
}

const navLinkStyle = {
  padding: "6px 12px",
  borderRadius: "999px",
  textDecoration: "none",
  color: "#e5e7eb",
  border: "1px solid rgba(148,163,184,0.15)",
  backgroundColor: "rgba(15,23,42,0.9)",
  boxShadow: "0 8px 20px rgba(15,23,42,0.9)",
  transition:
    "background-color 100ms ease, border-color 100ms ease, transform 80ms ease, box-shadow 80ms ease",
};
