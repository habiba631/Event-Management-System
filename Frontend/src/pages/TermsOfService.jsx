import StaticPageLayout from '../components/StaticPageLayout';

export default function TermsOfService() {
  return (
    <StaticPageLayout
      tag="✦ Legal"
      title="Terms of Service"
      subtitle="Last updated: June 2026"
    >
      <p>
        By using Eventify, you agree to these Terms of Service. Please read them carefully
        before creating an account or using the platform.
      </p>
      <h2>Using Eventify</h2>
      <p>
        You must provide accurate information when registering. You are responsible for
        maintaining the security of your account and for all activity under it.
      </p>
      <h2>Organizer responsibilities</h2>
      <ul>
        <li>Event listings must be accurate and not misleading.</li>
        <li>Organizers are responsible for delivering events as described.</li>
        <li>Refund and cancellation policies must be clearly communicated to attendees.</li>
      </ul>
      <h2>Attendee responsibilities</h2>
      <ul>
        <li>Bookings are subject to event capacity and organizer policies.</li>
        <li>Reviews should be honest and respectful.</li>
        <li>Misuse of the platform may result in account suspension.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Paid events are processed through secure third-party payment providers. Eventify is
        not responsible for disputes between organizers and attendees beyond what is
        described in our platform policies.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        Eventify is provided &quot;as is.&quot; We are not liable for event cancellations,
        changes, or issues arising from third-party organizers or venues.
      </p>
      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the platform after
        changes constitutes acceptance of the updated terms.
      </p>
    </StaticPageLayout>
  );
}
