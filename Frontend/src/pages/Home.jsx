import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import EventCard from '../components/EventCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 6,
  dur: Math.random() * 3 + 2,
}));

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const eventsCount = useCountUp(events.length || 120, 1800, statsVisible);
  const usersCount  = useCountUp(3400, 2000, statsVisible);
  const citiesCount = useCountUp(24, 1600, statsVisible);
  const ratingCount = useCountUp(98, 1400, statsVisible);

  useEffect(() => {
    getAllEvents({ status: 'open' }).then((res) => {
      setEvents(res.data.slice(0, 6));
    }).catch(() => {}).finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const stars = useMemo(() => STARS, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-overlay" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          {stars.map((s) => (
            <div key={s.id} className="star" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }} />
          ))}
        </div>

        <div className="container hero-content">
          <div className="animate-fadeInDown">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              The #1 Event Platform
            </div>
          </div>
          <h1 className="hero-title animate-fadeInUp delay-100">
            Discover Events<br />
            <span className="text-gradient">That Move You</span>
          </h1>
          <p className="hero-desc animate-fadeInUp delay-200">
            From intimate workshops to massive concerts — find, book, and host extraordinary experiences that bring people together.
          </p>
          <div className="hero-actions animate-fadeInUp delay-300">
            <Link to="/events" className="btn btn-primary btn-lg">Browse Events →</Link>
            {!user && <Link to="/signup" className="btn btn-secondary btn-lg">Become an Organizer</Link>}
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {[
              { value: `${eventsCount}+`, label: 'Events Listed', gradient: 'var(--gradient-primary)' },
              { value: `${usersCount.toLocaleString()}+`, label: 'Happy Attendees', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
              { value: `${citiesCount}+`, label: 'Cities Covered', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
              { value: `${ratingCount}%`, label: 'Satisfaction Rate', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
            ].map((stat) => (
              <div key={stat.label} className="stat-item animate-fadeInUp">
                <div className="stat-number text-gradient" style={{ background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ──────────────────────── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-tag">✦ Live Now</div>
              <h2 className="section-title animate-fadeInLeft">Upcoming Events</h2>
              <p className="section-subtitle animate-fadeInLeft delay-100">Hand-picked open events you can book right now.</p>
            </div>
            <Link to="/events" className="btn btn-ghost animate-fadeInRight" style={{ flexShrink: 0 }}>View all →</Link>
          </div>

          {loadingEvents ? (
            <div className="events-grid">
              {[1,2,3].map((i) => (
                <div key={i} className="event-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ height: 16, width: '60%' }} />
                    <div className="skeleton" style={{ height: 20 }} />
                    <div className="skeleton" style={{ height: 14, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((ev, i) => (
                <div key={ev._id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <EventCard
                    event={ev}
                    onBook={user?.role === 'Customer' ? (e) => setBookingEvent(e) : null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎭</div>
              <h3>No events yet</h3>
              <p>Check back soon — exciting events are being added every day.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="how-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div className="section-tag" style={{ margin: '0 auto 1rem' }}>How it works</div>
            <h2 className="section-title animate-fadeInUp">Three Steps to Your Next Adventure</h2>
          </div>
          <div className="steps-grid">
            {[
              { num: '1', title: 'Browse Events', desc: 'Explore hundreds of events across music, tech, sports, food, and more. Filter by category, date, or city.', emoji: '🔍' },
              { num: '2', title: 'Book Instantly', desc: 'Reserve your spot with a single click. No complicated checkout — just pick your tickets and confirm.', emoji: '🎟' },
              { num: '3', title: 'Experience It', desc: 'Show up, connect with others, and create memories. Rate your experience and discover your next event.', emoji: '🎉' },
            ].map((step, i) => (
              <div key={step.num} className="step-card animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-num">{step.emoji}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner animate-fadeInUp">
            <div className="section-tag" style={{ margin: '0 auto 1rem' }}>Ready to start?</div>
            <h2>Host Your Own Event</h2>
            <p>Join thousands of organizers who use Eventify to create unforgettable experiences. Powerful tools, simple setup.</p>
            <div className="cta-btns">
              {!user ? (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">Start Organizing →</Link>
                  <Link to="/events" className="btn btn-secondary btn-lg">Explore Events</Link>
                </>
              ) : user.role === 'EventOrganizer' ? (
                <Link to="/organizer/create" className="btn btn-primary btn-lg">Create Event →</Link>
              ) : (
                <Link to="/events" className="btn btn-primary btn-lg">Browse All Events →</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
          onSuccess={() => setBookingEvent(null)}
        />
      )}
    </>
  );
}
