import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}>
              <div style={{ width: 28, height: 28, background: 'var(--gradient-primary)', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✦</div>
              Eventify
            </Link>
            <p>Discover, create, and attend amazing events. Connecting people through unforgettable experiences.</p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/events">All Events</Link></li>
              <li><Link to="/events?category=Music">Music</Link></li>
              <li><Link to="/events?category=Technology">Technology</Link></li>
              <li><Link to="/events?category=Sports">Sports</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Organizers</h4>
            <ul>
              <li><Link to="/signup">Get Started</Link></li>
              <li><Link to="/organizer/create">Create Event</Link></li>
              <li><Link to="/organizer/my-events">My Events</Link></li>
              <li><Link to="/organizer/attendees">Attendees</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/legal/policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Eventify. All rights reserved.</p>
          <div className="footer-socials">
            {['𝕏', 'in', 'f', '▶'].map((icon, i) => (
              <a key={i} href="#" className="footer-social-btn">{icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
