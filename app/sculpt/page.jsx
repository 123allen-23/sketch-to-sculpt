// app/sculpt/page.jsx
import { supabase } from "../../lib/supabaseClient";

export default async function SculptLandingPage({ searchParams }) {
  const pieceId = searchParams?.piece || null;

  // Fetch the real artwork
  let artwork = null;

  if (pieceId) {
    const { data } = await supabase
      .from("art_gallery")
      .select("*")
      .eq("id", pieceId)
      .single();

    artwork = data;
  }

  return (
    <section style={{ padding: "2rem", color: "#e8ecf1" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
        Prepare for Sculpture
      </h1>

      {!pieceId || !artwork ? (
        <p>
          No artwork selected. Go back to the{" "}
          <a href="/gallery" style={{ color: "#7dd3fc" }}>
            gallery
          </a>
          .
        </p>
      ) : (
        <>
          <p style={{ marginBottom: "1rem" }}>
            This is the staging area for turning your piece into refined
            prints, 3D renders, or physical sculptures.
          </p>

          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "#0f172a",
              borderRadius: "10px",
              border: "1px solid #1e293b",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>Selected Artwork</h3>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <img
                src={artwork.image_url}
                alt={artwork.title}
                width={160}
                height={160}
                style={{
                  borderRadius: "8px",
                  objectFit: "cover",
                  background: "#1e293b",
                }}
              />

              <div>
                <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{artwork.title}</h2>
                <p style={{ margin: "0.3rem 0", opacity: 0.8 }}>
                  {artwork.category}
                </p>
                <p style={{ margin: "0.3rem 0" }}>{artwork.description}</p>
              </div>
            </div>
          </div>

          <h3>Next Steps</h3>

          <ol style={{ paddingLeft: "1.2rem", marginBottom: "2rem" }}>
            <li style={{ marginBottom: "1rem" }}>
              <strong>Choose render style</strong> – graphite print, inked
              refinements, or digital shading.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong>Pick 3D direction</strong> – flat relief, full sculpture,
              or engraved.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong>Set pricing</strong> once the marketplace flow is wired.
            </li>
          </ol>

          <a
            href="/gallery"
            style={{
              background: "#1e293b",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              marginRight: "1rem",
              border: "1px solid #334155",
              color: "#e8ecf1",
            }}
          >
            Back to gallery
          </a>

          <a
            href="/upload"
            style={{
              background: "linear-gradient(90deg,#22c55e,#16a34a)",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Upload another sketch
          </a>
        </>
      )}
    </section>
  );
}
