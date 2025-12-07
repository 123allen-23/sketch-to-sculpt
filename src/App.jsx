import './App.css';

function App() {
  return (
    <div className="app">
      {/* Top Bar */}
      <header className="topbar">
        <div className="logo">
          <span className="logo-accent">Sketch</span>
          <span>→</span>
          <span className="logo-accent">Sculpt</span>
        </div>
        <nav className="nav-links">
          <button className="nav-button">Gallery</button>
          <button className="nav-button">Pricing</button>
          <button className="nav-button primary">Get Started</button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <section className="hero-left">
          <h1>
            Turn <span className="highlight">rough sketches</span> into
            <br />
            <span className="highlight">real sculptures.</span>
          </h1>
          <p className="hero-text">
            Snap a photo of your drawing, we help shape it,
            and your 3D-printable sculpture is ready to bring into the real world.
          </p>

          <div className="hero-actions">
            <button className="cta-main">Upload a Sketch</button>
            <button className="cta-secondary">View Example Pieces</button>
          </div>

          <p className="hero-note">
            No fancy tools, no tech skills. Just your art, a phone camera, and this app.
          </p>
        </section>

        {/* Sketch → Sculpt Preview Card */}
        <section className="hero-right">
          <div className="preview-card">
            <div className="preview-header">Preview Flow</div>
            <div className="preview-body">
              <div className="preview-column">
                <div className="preview-label">Step 1</div>
                <div className="preview-box sketch-box">
                  Your pencil sketch
                </div>
              </div>
              <div className="preview-arrow">→</div>
              <div className="preview-column">
                <div className="preview-label">Step 2</div>
                <div className="preview-box sculpt-box">
                  3D sculpt mockup
                </div>
              </div>
            </div>
            <div className="preview-footer">
              Next: choose material, size, and shipping.
            </div>
          </div>
        </section>
      </main>

      {/* Feature Row */}
      <section className="features">
        <div className="feature-card">
          <h2>Built for artists</h2>
          <p>
            You draw how you draw. We don’t need clean lines or digital files.
            Just a clear photo of your work.
          </p>
        </div>
        <div className="feature-card">
          <h2>From idea to object</h2>
          <p>
            See a 3D preview, tweak the shape, then send it to print in metal,
            resin, or other materials.
          </p>
        </div>
        <div className="feature-card">
          <h2>Sell your sculptures</h2>
          <p>
            Turn your designs into a small shop. We’ll hook in a marketplace
            and payments as the app grows.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Sketch→Sculpt · creator-first · prototype in progress</p>
      </footer>
    </div>
  );
}

export default App;
