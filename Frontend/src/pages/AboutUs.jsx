import StaticPageLayout from '../components/StaticPageLayout';

export default function AboutUs() {
  return (
    <StaticPageLayout
      tag="✦ Our Story"
      title="About Eventify"
      subtitle="Connecting people through unforgettable experiences."
    >
      <p>
        Eventify is an event management platform built to help organizers create, promote,
        and manage events — and to help attendees discover experiences they will love.
      </p>
      <h2>What we do</h2>
      <p>
        From concerts and workshops to conferences and community meetups, Eventify gives
        organizers the tools to publish events, track registrations, and engage with their
        audience. Attendees can browse events, book tickets, and share reviews after they attend.
      </p>
      <h2>Our mission</h2>
      <p>
        We believe great events bring people together. Our mission is to make event discovery
        simple and event management effortless, so creators can focus on what matters most:
        delivering memorable experiences.
      </p>
      <h2>Who we serve</h2>
      <ul>
        <li><strong>Attendees</strong> — find and book events near you or online.</li>
        <li><strong>Organizers</strong> — create events, manage capacity, and view attendees.</li>
        <li><strong>Communities</strong> — grow audiences and build lasting connections.</li>
      </ul>
    </StaticPageLayout>
  );
}
