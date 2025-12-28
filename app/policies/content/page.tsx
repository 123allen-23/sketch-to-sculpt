export default function ContentAndConductPolicy() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Content & Conduct Policy</h1>
      <p style={{ opacity: 0.8 }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h2>Purpose</h2>
      <p>
        Sketch→Sculpt exists to help artists transform original creative work
        into refined visuals and sculpt-ready concepts. This policy exists to
        protect creators, viewers, and the platform itself.
      </p>

      <h2>Allowed Content</h2>
      <ul>
        <li>Original artwork created or owned by the user</li>
        <li>Concept art, sketches, designs, and experimental pieces</li>
        <li>AI-assisted transformations of user-owned content</li>
      </ul>

      <h2>Prohibited Content</h2>
      <ul>
        <li>Stolen or plagiarized artwork</li>
        <li>Copyrighted material you do not own or have rights to</li>
        <li>Hate speech, extremist content, or harassment</li>
        <li>Explicit sexual content involving minors</li>
        <li>Illegal content or instructions</li>
        <li>Non-consensual imagery</li>
      </ul>

      <h2>AI Usage</h2>
      <p>
        AI tools provided by Sketch→Sculpt are assistive. Users remain fully
        responsible for the content they upload and generate.
      </p>

      <h2>Public Gallery Submissions</h2>
      <p>
        Content submitted to the public gallery is reviewed before display.
        Sketch→Sculpt reserves the right to approve, reject, or remove any
        submission at its sole discretion.
      </p>

      <h2>Enforcement</h2>
      <p>
        Violations may result in content removal, account suspension, or
        termination without notice.
      </p>

      <h2>Reporting</h2>
      <p>
        If you believe content violates this policy, contact us through the
        provided support channels.
      </p>
    </main>
  );
}
