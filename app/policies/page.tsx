import Link from "next/link";

const card: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.02)",
  padding: 16,
};

export default function PoliciesHub() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, marginTop: 10 }}>Policies</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        These documents explain how Sketch→Sculpt handles accounts, uploads, privacy, and acceptable use.
      </p>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <div style={card}>
          <Link href="/policies/terms" style={{ fontWeight: 900, textDecoration: "none" }}>Terms of Service</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Rules of use, ownership, limitations, and accounts.</div>
        </div>

        <div style={card}>
          <Link href="/policies/privacy" style={{ fontWeight: 900, textDecoration: "none" }}>Privacy Policy</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>What data we collect, why, and how it’s used.</div>
        </div>

        <div style={card}>
          <Link href="/policies/content" style={{ fontWeight: 900, textDecoration: "none" }}>Content & Acceptable Use</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>What’s allowed, what’s not, and enforcement.</div>
        </div>

        <div style={card}>
          <Link href="/policies/dmca" style={{ fontWeight: 900, textDecoration: "none" }}>Copyright (DMCA)</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Takedown process and repeat-infringer policy.</div>
        </div>

        <div style={card}>
          <Link href="/policies/refunds" style={{ fontWeight: 900, textDecoration: "none" }}>Refund Policy</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>How refunds work (or don’t) for digital and physical items.</div>
        </div>

        <div style={card}>
          <Link href="/policies/contact" style={{ fontWeight: 900, textDecoration: "none" }}>Contact</Link>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Support and legal contact methods.</div>
        </div>
      </div>
    </main>
  );
}

