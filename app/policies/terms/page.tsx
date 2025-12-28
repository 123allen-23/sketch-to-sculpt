export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Terms of Service</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Overview</h2>
      <p>
        Sketch→Sculpt lets you upload artwork and generate refined images and 3D render previews.
        By using the service, you agree to these terms.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for your account activity and keeping your login secure. We may suspend accounts
        that violate these terms or applicable laws.
      </p>

      <h2>3. Your Content & Ownership</h2>
      <p>
        You retain ownership of the artwork you upload. You grant Sketch→Sculpt a limited license to host,
        process, and display your content to provide the service.
      </p>

      <h2>4. Prohibited Use</h2>
      <p>
        You may not use the service for illegal activity, harassment, or to upload content you don’t have rights to.
        See the Content & Acceptable Use policy for details.
      </p>

      <h2>5. AI Outputs</h2>
      <p>
        AI-generated outputs can vary. You are responsible for verifying results before using them commercially,
        printing, or manufacturing.
      </p>

      <h2>6. Availability & Changes</h2>
      <p>
        We may change or discontinue features at any time. We aim for reliability, but the service is provided “as is.”
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the fullest extent allowed by law, Sketch→Sculpt is not liable for indirect, incidental, or consequential
        damages arising from use of the service.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions, use the Contact page.
      </p>
    </main>
  );
}
