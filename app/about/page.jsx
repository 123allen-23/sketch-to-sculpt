export const metadata = {
  title: 'About — Sketch→Sculpt',
  description:
    'Sketch→Sculpt turns hand-drawn art into refined prints, 3D renders, and physical sculpts—one piece at a time.',
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.06)',
        fontSize: 12,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

function Card({ title, children }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ opacity: 0.82, lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

function Step({ n, title, desc }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '46px 1fr',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.18)',
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 900,
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
        <div style={{ opacity: 0.8, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1050, margin: '0 auto' }}>
      {/* HERO */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          background:
            'radial-gradient(1200px 600px at 20% 0%, rgba(120,160,255,0.12), transparent 60%), rgba(255,255,255,0.03)',
          borderRadius: 18,
          padding: 20,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Pill>Sketch → Refine → Render → Sculpt</Pill>
          <Pill>Save every version</Pill>
          <Pill>Built for artists</Pill>
          <Pill>Credits-based actions</Pill>
        </div>

        <h1 style={{ fontSize: 34, margin: '14px 0 8px', fontWeight: 900 }}>
          Sketch→Sculpt
        </h1>

        <div style={{ opacity: 0.85, lineHeight: 1.55, fontSize: 16 }}>
          Sketch→Sculpt turns a hand-drawn idea into a finished, collectible
          piece—without you losing the soul of the original. You start with a
          photo of your drawing. From there, you can refine it, generate a 3D
          render, and ultimately create a sculpt-ready output.
          <br />
          <br />
          The goal is simple: <b>help artists finish work</b>—and keep every step
          saved so you can keep improving it instead of starting over.
        </div>

        <div style={{ marginTop: 14, opacity: 0.72 }}>
          One piece at a time. No fluff. Just progress.
        </div>
      </div>

      {/* WHAT MAKES IT DIFFERENT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <Card title="Not a filter app">
          This isn’t “slap a style on it and call it done.” The pipeline is built
          around <b>stages</b> so you can review, redo, and upgrade with intent.
        </Card>

        <Card title="Versions are the product">
          Every output (original, refined, render, sculpt) can be saved and
          compared. That’s how a sketch becomes a finished body of work.
        </Card>

        <Card title="Artists stay in control">
          AI helps you move faster, but you still steer. The toolset expands at
          each stage so you can keep shaping the piece.
        </Card>
      </div>

      {/* THE PIPELINE */}
      <h2 style={{ fontSize: 22, margin: '10px 0 10px', fontWeight: 900 }}>
        The pipeline
      </h2>

      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <Step
          n="1"
          title="Original (Upload)"
          desc="Upload a photo of your drawing. We store it as the source of truth. This is your anchor—your style, your hand."
        />
        <Step
          n="2"
          title="Refined (AI)"
          desc="Clean lines, stronger contrast, better presentation. You can redo until it’s right—each redo is a new saved version."
        />
        <Step
          n="3"
          title="3D Render (AI)"
          desc="Create a render that translates your drawing into depth and form. This stage sets the look before physical output."
        />
        <Step
          n="4"
          title="Sculpt"
          desc="Sculpt-ready output. The end goal is a piece you can visualize, approve, and eventually print/manufacture."
        />
      </div>

      {/* WHAT USERS CAN DO */}
      <h2 style={{ fontSize: 22, margin: '10px 0 10px', fontWeight: 900 }}>
        What you can do here
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <Card title="Finish the piece">
          Use the pipeline to push a sketch past the “almost” stage. Each step
          is designed to move the work forward.
        </Card>

        <Card title="Redo without regret">
          Don’t like an output? Redo it. Keep the versions. Compare them. Pick
          the best one and move on.
        </Card>

        <Card title="Build a living portfolio">
          Your gallery becomes your portfolio—organized by piece, with all four
          stages visible in one row.
        </Card>
      </div>

      {/* ROADMAP */}
      <h2 style={{ fontSize: 22, margin: '10px 0 10px', fontWeight: 900 }}>
        What’s coming next
      </h2>

      <div
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.82, lineHeight: 1.7 }}>
          <li>
            <b>Artist Control Room:</b> credits, job history, exports, upgrades
          </li>
          <li>
            <b>Stage tools:</b> refine tools, render tools, sculpt tools (different
            toolkits per stage)
          </li>
          <li>
            <b>Preview mode:</b> better viewing and approval before creating the next stage
          </li>
          <li>
            <b>Marketplace + upgrades:</b> premium materials and finished products
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.18)',
          borderRadius: 18,
          padding: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>
            Ready to run one through the line?
          </div>
          <div style={{ opacity: 0.8 }}>
            Upload a sketch, then build it stage-by-stage in the Gallery.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/upload"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.10)',
              textDecoration: 'none',
              color: 'white',
              fontWeight: 800,
            }}
          >
            Go to Upload
          </a>
          <a
            href="/gallery"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              textDecoration: 'none',
              color: 'white',
              fontWeight: 800,
            }}
          >
            Go to Gallery
          </a>
        </div>
      </div>
    </div>
  )
}
