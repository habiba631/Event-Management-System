import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2 + 0.5, delay: Math.random() * 6, dur: Math.random() * 3 + 2,
}));

const CATEGORIES = [
  {
    label: 'Music', to: '/events?category=Music', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  },
  {
    label: 'Tech', to: '/events?category=Technology', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    label: 'Sports', to: '/events?category=Sports', color: '#10b981', bg: 'rgba(16,185,129,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/></svg>,
  },
  {
    label: 'Art & Culture', to: '/events?category=Art', color: '#ec4899', bg: 'rgba(236,72,153,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>,
  },
  {
    label: 'Business', to: '/events?category=Business', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  {
    label: 'Wellness', to: '/events?category=Wellness', color: '#34d399', bg: 'rgba(52,211,153,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
  {
    label: 'Comedy', to: '/events?category=Comedy', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
];

const STEPS = [
  {
    num: '01', title: 'Discover Events',
    desc: 'Browse events across Cairo, Alexandria, Giza, and cities all over Egypt — filtered by category, date, or price.',
    accent: 'var(--c-purple-400)', bg: 'rgba(139,92,246,0.1)',
    icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    num: '02', title: 'Book Instantly',
    desc: 'Reserve your spot in seconds with secure Stripe checkout. Get your QR ticket immediately — no waiting.',
    accent: 'var(--c-cyan)', bg: 'rgba(6,182,212,0.1)',
    icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>,
  },
  {
    num: '03', title: 'Live the Moment',
    desc: 'Show up, connect with Egyptians who share your passion, and create memories worth telling.',
    accent: 'var(--c-gold)', bg: 'rgba(245,158,11,0.1)',
    icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
];

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [catRef, catVisible] = useReveal(0.2);
  const [featRef, featVisible] = useReveal(0.1);
  const [howRef, howVisible] = useReveal(0.12);
  const [ctaRef, ctaVisible] = useReveal(0.2);

  const eventsCount = useCountUp(180, 1800, statsVisible);
  const usersCount  = useCountUp(12000, 2000, statsVisible);
  const citiesCount = useCountUp(15, 1600, statsVisible);
  const ratingCount = useCountUp(98, 1400, statsVisible);

  useEffect(() => {
    getAllEvents({ status: 'open' })
      .then((res) => setEvents(res.data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
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
          <div className="hero-orb hero-orb-4" />
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
              Egypt's #1 Event Platform
            </div>
          </div>

          <h1 className="hero-title animate-fadeInUp delay-100">
            Experience Egypt<br />
            <span className="text-gradient">Like Never Before</span>
          </h1>

          <p className="hero-desc animate-fadeInUp delay-200">
            From Cairo rooftop concerts to Alexandria beach festivals — discover, book, and live extraordinary moments with people who share your passion.
          </p>

          <div className="hero-actions animate-fadeInUp delay-300">
            <Link to="/events" className="btn btn-primary btn-lg">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Explore Events
            </Link>
            {!user && (
              <Link to="/signup" className="btn btn-secondary btn-lg">Become an Organizer →</Link>
            )}
          </div>

          <div className="hero-trust animate-fadeInUp delay-400">
            {[
              'Free to browse',
              'Secure Stripe checkout',
              'Instant QR tickets',
            ].map((item, i) => (
              <div key={item} style={{ display: 'contents' }}>
                {i > 0 && <span className="hero-trust-sep" />}
                <div className="hero-trust-item">
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--c-emerald)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────── */}
      <section className="categories-section" ref={catRef}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--c-text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Browse by category</p>
            <Link to="/events" style={{ fontSize: '0.82rem', color: 'var(--c-purple-400)', fontWeight: 600, transition: 'color 0.2s' }}>See all →</Link>
          </div>
          <div className="categories-strip">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                to={cat.to}
                className={`category-chip${catVisible ? ' cat-visible' : ''}`}
                style={{ '--i': i, color: cat.color, borderColor: cat.bg.replace('0.12', '0.25') }}
              >
                <span style={{ color: cat.color, display: 'flex' }}>{cat.icon}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {[
              { value: `${eventsCount}+`, label: 'Events Across Egypt', gradient: 'var(--gradient-primary)' },
              { value: `${usersCount.toLocaleString()}+`, label: 'Egyptians Attended', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
              { value: `${citiesCount}+`, label: 'Egyptian Cities', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
              { value: `${ratingCount}%`, label: 'Satisfaction Rate', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
            ].map((stat) => (
              <div key={stat.label} className="stat-item">
                <div className="stat-number" style={{ background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ──────────────────────── */}
      <section className="featured-section" ref={featRef}>
        <div className="container">
          <div className="section-header">
            <div className={`reveal-left${featVisible ? ' revealed' : ''}`}>
              <div className="section-tag">
                <span style={{ width: 7, height: 7, background: 'var(--c-emerald)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Open Now
              </div>
              <h2 className="section-title">Upcoming Events</h2>
              <p className="section-subtitle">Hand-picked open events you can book right now across Egypt.</p>
            </div>
            <Link to="/events" className={`btn btn-ghost reveal-right${featVisible ? ' revealed' : ''}`} style={{ flexShrink: 0 }}>
              View all events →
            </Link>
          </div>

          {loadingEvents ? (
            <div className="events-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="event-card">
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
                <div
                  key={ev._id}
                  className={`reveal-up${featVisible ? ' revealed' : ''}`}
                  style={{ transitionDelay: `${i * 0.09}s` }}
                >
                  <EventCard event={ev} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>No events yet</h3>
              <p>Check back soon — exciting events are being added every day across Egypt.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="how-section" ref={howRef}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div className={`section-tag reveal-up${howVisible ? ' revealed' : ''}`} style={{ margin: '0 auto 1rem' }}>How it works</div>
            <h2 className={`section-title reveal-up${howVisible ? ' revealed' : ''}`} style={{ transitionDelay: '0.08s' }}>Three Steps to Your Next Adventure</h2>
            <p className={`section-subtitle reveal-up${howVisible ? ' revealed' : ''}`} style={{ margin: '0.75rem auto 0', maxWidth: 460, transitionDelay: '0.14s' }}>
              Whether you're attending or organizing — getting started takes less than a minute.
            </p>
          </div>
          <div className="steps-grid" style={{ marginTop: '3.5rem' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`step-card reveal-up${howVisible ? ' revealed' : ''}`}
                style={{ transitionDelay: `${0.1 + i * 0.14}s` }}
              >
                <div className="step-icon-wrap" style={{ background: step.bg, color: step.accent }}>
                  {step.icon}
                </div>
                <div className="step-num-label" style={{ color: step.accent }}>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <div className={`cta-inner reveal-up${ctaVisible ? ' revealed' : ''}`}>
            <div className="section-tag" style={{ margin: '0 auto 1rem' }}>Ready to start?</div>
            <h2>Host Your Own Event in Egypt</h2>
            <p>
              Join thousands of Egyptian organizers using Eventify — from Zamalek jazz nights to Sahel beach parties to Cairo tech summits.
            </p>
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
    </>
  );
}
