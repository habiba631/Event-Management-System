import StaticPageLayout from '../components/StaticPageLayout';

export default function PolicyPage() {
  return (
    <StaticPageLayout
      tag="✦ Legal"
      title="Privacy Policy"
      subtitle="Last updated: June 2026"
    >
      <p>
        This Privacy Policy explains how Eventify collects, uses, and protects your
        information when you use our platform.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details such as name, email, username, and profile information.</li>
        <li>Event and booking data when you register for or create events.</li>
        <li>Payment-related information processed securely through our payment provider.</li>
        <li>Usage data such as pages visited and actions taken on the platform.</li>
      </ul>
      <h2>How we use your information</h2>
      <ul>
        <li>To provide and improve our event management services.</li>
        <li>To process bookings and communicate about your events.</li>
        <li>To maintain platform security and prevent fraud.</li>
        <li>To send important service updates and notifications.</li>
      </ul>
      <h2>Data sharing</h2>
      <p>
        We do not sell your personal data. We may share information with trusted service
        providers (such as payment processors) only as needed to operate the platform, or
        when required by law.
      </p>
      <h2>Your rights</h2>
      <p>
        You may update your profile information at any time. You may also request access to,
        correction of, or deletion of your personal data by contacting us through our Contact page.
      </p>
      <h2>Contact</h2>
      <p>
        If you have questions about this policy, please reach out via our Contact page.
      </p>
    </StaticPageLayout>
  );
}
