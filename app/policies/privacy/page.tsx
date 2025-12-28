export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Privacy Policy</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. What we collect</h2>
      <ul>
        <li>Account info (email, authentication identifiers)</li>
        <li>Uploaded images and generated outputs you create in the app</li>
        <li>Basic usage data for reliability and debugging (errors, performance)</li>
      </ul>

      <h2>2. How we use data</h2>
      <ul>
        <li>Provide the service (uploading, processing, storing versions)</li>
        <li>Security (prevent abuse, detect fraud)</li>
        <li>Improve reliability and performance</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We share data with service providers needed to run the app (hosting, storage, authentication, and AI processing).
        We do not sell personal information.
      </p>

      <h2>4. Retention</h2>
      <p>
        We keep your content and account data while your account is active. You can request deletion via the Contact page.
      </p>

      <h2>5. Security</h2>
      <p>
        We use reasonable safeguards, but no system is perfectly secure. Use strong passwords and protect your account.
      </p>

      <h2>6. Children</h2>
      <p>
        The service is not intended for children under 13.
      </p>

      <h2>7. Contact</h2>
      <p>
        For privacy requests, use the Contact page.
      </p>
    </main>
  );
}
