export default function RefundsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Refund Policy</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 style={{ marginTop: 18 }}>Current status</h2>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        Sketch→Sculpt is currently in an early/beta stage. If paid plans or physical products are introduced,
        this policy will be updated with clear rules for refunds, cancellations, and returns.
      </p>

      <h2 style={{ marginTop: 18 }}>Digital items</h2>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        AI-generated outputs and digital downloads may be non-refundable once delivered, except where required by law.
        If a paid plan is introduced, we will publish the refund/cancellation window and any eligibility rules here.
      </p>

      <h2 style={{ marginTop: 18 }}>Physical items</h2>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        If physical production or shipping becomes available, refunds or replacements may be offered when an item arrives
        damaged or incorrect, subject to verification and time limits that will be listed here.
      </p>

      <h2 style={{ marginTop: 18 }}>Contact</h2>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        For refund questions, use the Contact page.
      </p>
    </main>
  );
}
