export default function DmcaPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Copyright (DMCA)</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>Takedown requests</h2>
      <p>
        If you believe content on Sketch→Sculpt infringes your copyright, send a notice through the Contact page with:
      </p>
      <ul>
        <li>Your name and contact information</li>
        <li>Identification of the copyrighted work</li>
        <li>The URL or clear identification of the infringing content</li>
        <li>A statement of good-faith belief the use is unauthorized</li>
        <li>A statement under penalty of perjury that your notice is accurate</li>
      </ul>

      <h2>Repeat infringers</h2>
      <p>
        We may terminate accounts that repeatedly infringe copyright.
      </p>
    </main>
  );
}
