import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getEventById } from '../api/events';
import { getEventReviews } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';

const CATEGORY_GRADIENTS = {
  Music:      'linear-gradient(135deg,#7c3aed,#ec4899)',
  Sports:     'linear-gradient(135deg,#0ea5e9,#10b981)',
  Technology: 'linear-gradient(135deg,#6366f1,#06b6d4)',
  Arts:       'linear-gradient(135deg,#f59e0b,#ef4444)',
  Food:       'linear-gradient(135deg,#f97316,#fbbf24)',
  Business:   'linear-gradient(135deg,#3b82f6,#6d28d9)',
  Health:     'linear-gradient(135deg,#10b981,#06b6d4)',
  Education:  'linear-gradient(135deg,#8b5cf6,#3b82f6)',
  Default:    'linear-gradient(135deg,#7c3aed,#ec4899)',
};

const CATEGORY_EMOJIS = {
  Music: '🎵', Sports: '⚽', Technology: '💻', Arts: '🎨',
  Food: '🍕', Business: '💼', Health: '🏃', Education: '📚', Default: '✨',
};

const STATUS_BADGE = {
  open:      { cls: 'badge-green',  label: 'Open' },
  full:      { cls: 'badge-amber',  label: 'Full' },
  draft:     { cls: 'badge-gray',   label: 'Draft' },
  completed: { cls: 'badge-gray',   label: 'Ended' },
  cancelled: { cls: 'badge-red',    label: 'Cancelled' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function StarRating({ rating, size = 18, animate = false }) {
  const filled = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size} height={size}
          viewBox="0 0 24 24"
          fill={s <= filled ? '#f59e0b' : 'none'}
          stroke={s <= filled ? '#f59e0b' : '#334155'}
          strokeWidth="2"
          className={animate ? 'animate-star-pop' : undefined}
          style={animate ? { animationDelay: `${0.15 + s * 0.07}s` } : undefined}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review, index }) {
  const name = review.user
    ? `${review.user.firstName ?? ''} ${review.user.lastName ?? ''}`.trim() || review.user.username
    : 'Anonymous';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      className="review-card animate-review-in"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {review.user?.profileImage ? (
          <img
            src={review.user.profileImage}
            alt={name}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.1rem' }}>{name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)' }}>{date}</div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      {review.comment && (
        <p style={{ fontSize: '0.875rem', color: 'var(--c-text2)', lineHeight: 1.65, margin: 0 }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}

const INFO_ITEMS = (event) => [
  {
    label: 'Date',
    value: formatDate(event.startsAt),
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8"  y1="2" x2="8"  y2="6" />
        <line x1="3"  y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Time',
    value: `${formatTime(event.startsAt)}${event.endsAt ? ` – ${formatTime(event.endsAt)}` : ''}`,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Location',
    value: [event.location, event.city, event.country].filter(Boolean).join(', '),
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: 'Capacity',
    value: `${event.registrations} / ${event.capacity} registered`,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/events');
    }
  };

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setLoadingEvent(true);
    getEventById(id)
      .then((res) => setEvent(res.data))
      .catch(() => setFetchError('Event not found.'))
      .finally(() => setLoadingEvent(false));

    setLoadingReviews(true);
    getEventReviews(id)
      .then((res) => {
        setReviews(res.data.reviews ?? []);
        setAvgRating(res.data.averageRating ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [id]);

  const handleBookingSuccess = () => {
    getEventById(id).then((res) => setEvent(res.data)).catch(() => {});
  };

  /* ── Loading skeleton ── */
  if (loadingEvent) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 860, margin: '0 auto' }}>
          <div className="skeleton" style={{ height: 340, borderRadius: 'var(--r-xl)' }} />
          <div className="skeleton" style={{ height: 34, width: '55%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}>
            {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 'var(--r-lg)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (fetchError || !event) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <h3>{fetchError || 'Event not found'}</h3>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const gradient = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.Default;
  const emoji = CATEGORY_EMOJIS[event.category] || CATEGORY_EMOJIS.Default;
  const status = STATUS_BADGE[event.status] || STATUS_BADGE.draft;
  const seatsLeft = event.seatsLeft ?? Math.max(0, event.capacity - event.registrations);
  const pctFilled = Math.min(100, Math.round((event.registrations / event.capacity) * 100));
  const seatsBarColor = pctFilled >= 90 ? '#ef4444' : pctFilled >= 60 ? '#f59e0b' : '#10b981';
  const isPaid = (event.price ?? 0) > 0;
  const isCustomer = user?.role === 'Customer';
  const canBook = isCustomer && event.status === 'open' && seatsLeft > 0;

  return (
    <div style={{ paddingBottom: '5rem' }}>

      {/* ── Hero Banner ── */}
      <div style={{
        width: '100%',
        height: 'clamp(280px, 42vw, 440px)',
        background: gradient,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="hero-img-burn"
          />
        ) : (
          <span style={{ fontSize: '5rem', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}>
            {emoji}
          </span>
        )}

        {/* Gradient overlay — heavy at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,5,15,0.08) 0%, rgba(5,5,15,0.45) 60%, rgba(5,5,15,0.92) 100%)',
          zIndex: 1,
        }} />

        {/* Back button */}
        <button type="button" className="detail-back-btn" onClick={handleBack}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Title overlay at bottom of hero */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 'clamp(1rem,3vw,2rem)',
          zIndex: 2,
        }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="event-card-badges" style={{ marginBottom: '0.6rem' }}>
              <span className="badge badge-purple">{event.category}</span>
              <span className={`badge ${status.cls}`}>{status.label}</span>
              <span className={`badge ${isPaid ? 'badge-amber' : 'badge-green'}`}>
                {isPaid ? `EGP ${(event.price / 100).toFixed(2)}` : 'Free'}
              </span>
            </div>
            <h1 className="animate-fadeInUp" style={{
              fontSize: 'clamp(1.5rem,4.5vw,2.6rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#fff',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="container" style={{ maxWidth: 900, paddingTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Organizer + Book CTA row ── */}
          <div className="animate-fadeInUp" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {event.organizer?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organized by</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.organizer}</div>
              </div>
            </div>

            {isCustomer && (
              canBook ? (
                <button
                  className="btn btn-primary btn-book"
                  style={{ fontSize: '0.95rem', padding: '0.75rem 2rem', gap: '0.5rem' }}
                  onClick={() => setBookingOpen(true)}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
                  </svg>
                  Book Now
                </button>
              ) : event.status === 'full' ? (
                <button className="btn btn-secondary" disabled style={{ fontSize: '0.95rem', padding: '0.75rem 2rem' }}>
                  Sold Out
                </button>
              ) : null
            )}
          </div>

          {/* ── Info Grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
            gap: '0.75rem',
          }}>
            {INFO_ITEMS(event).map(({ label, value, icon }, i) => (
              <div
                key={label}
                className="detail-info-card animate-info-card-in"
                style={{ animationDelay: `${0.05 + i * 0.08}s` }}
              >
                <div className="detail-info-icon">{icon}</div>
                <div>
                  <div style={{
                    fontSize: '0.68rem', color: 'var(--c-text3)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem',
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--c-text)', fontWeight: 500, lineHeight: 1.45 }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Seats bar ── */}
          <div
            className="animate-fadeIn"
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--c-glass)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-lg)',
              animationDelay: '0.35s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.55rem' }}>
              <span>
                <strong style={{ color: seatsLeft <= 10 ? 'var(--c-error)' : 'var(--c-success)' }}>
                  {seatsLeft}
                </strong>
                <span style={{ color: 'var(--c-text2)' }}> seat{seatsLeft !== 1 ? 's' : ''} remaining</span>
              </span>
              <span style={{ color: 'var(--c-text3)', fontWeight: 600 }}>{pctFilled}% filled</span>
            </div>
            <div className="seats-bar" style={{ height: 7 }}>
              <div
                className="seats-bar-fill"
                style={{ width: `${pctFilled}%`, background: seatsBarColor, height: '100%', borderRadius: 'var(--r-full)' }}
              />
            </div>
          </div>

          {/* ── Description ── */}
          {event.description && (
            <div
              className="animate-fadeInUp"
              style={{
                padding: '1.6rem',
                background: 'var(--c-glass)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-xl)',
                animationDelay: '0.25s',
              }}
            >
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{
                  display: 'inline-block', width: 3, height: 18,
                  background: 'var(--gradient-primary)', borderRadius: 2, flexShrink: 0,
                }} />
                About this event
              </h2>
              <p style={{ fontSize: '0.93rem', color: 'var(--c-text2)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                {event.description}
              </p>
            </div>
          )}

          {/* ── Reviews ── */}
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, margin: 0,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{
                  display: 'inline-block', width: 3, height: 18,
                  background: 'var(--gradient-primary)', borderRadius: 2,
                }} />
                Reviews
              </h2>

              {reviews.length > 0 && (
                <div
                  className="animate-rating-reveal"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <StarRating rating={avgRating} size={16} animate />
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{avgRating.toFixed(1)}</span>
                  <span style={{
                    color: 'var(--c-text3)', fontSize: '0.8rem',
                    padding: '0.15rem 0.55rem',
                    background: 'var(--c-glass)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 'var(--r-full)',
                  }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Review list */}
            {loadingReviews ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 96, borderRadius: 'var(--r-lg)' }} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem', textAlign: 'center',
                background: 'var(--c-glass)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-xl)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem', opacity: 0.4 }}>💬</div>
                <p style={{ color: 'var(--c-text2)', margin: 0, fontSize: '0.9rem' }}>
                  No reviews yet — be the first to share your experience!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviews.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)}
              </div>
            )}
          </div>

          {/* ── Non-auth CTA ── */}
          {!user && event.status === 'open' && seatsLeft > 0 && (
            <div
              className="animate-fadeInUp"
              style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.08) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 'var(--r-xl)',
                textAlign: 'center',
                animationDelay: '0.3s',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎟</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '1.05rem' }}>
                Secure your spot
              </h3>
              <p style={{ margin: '0 0 1.25rem', color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} remaining — sign in to book now.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" className="btn btn-primary">Log In to Book</Link>
                <Link to="/signup" className="btn btn-secondary">Create Account</Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          event={event}
          onClose={() => setBookingOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
