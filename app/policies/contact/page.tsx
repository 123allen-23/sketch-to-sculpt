export default function ContactPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Contact</h1>
      <p style={{ opacity: 0.8 }}>
        For support, privacy requests, or copyright notices, contact:
      </p>

      <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 14 }}>
        <div><b>Support:</b> support@sketchtosculpt.com</div>
        <div style={{ marginTop: 6 }}><b>Legal:</b> legal@sketchtosculpt.com</div>
        <div style={{ marginTop: 6 }}><b>Copyright/DMCA:</b> dmca@sketchtosculpt.com</div>
      </div>

      <p style={{ marginTop: 14, opacity: 0.75 }}>
        If you haven’t set up domain email yet, replace these with the email you actually check.
      </p>
    </main>
  );
}
