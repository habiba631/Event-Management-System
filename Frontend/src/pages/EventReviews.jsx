import { useState, useEffect, useCallback } from 'react';
import { getAllEvents } from '../api/events';
import { getEventReviews } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getInitials(user) {
  if (!user) return '?';
  const f = user.firstName?.[0] || '';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

function StarDisplay({ value, size = '1rem' }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: '0.05em' }}>
      {'★'.repeat(value)}
      <span style={{ color: 'var(--c-border)' }}>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

function AverageRatingBadge({ avg, total }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', textAlign: 'center', minWidth: 90 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {avg > 0 ? avg.toFixed(1) : '—'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Rating</div>
      </div>
      <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', textAlign: 'center', minWidth: 90 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {total}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reviews</div>
      </div>
      {avg > 0 && (
        <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center' }}>
          <StarDisplay value={Math.round(avg)} size="1.2rem" />
        </div>
      )}
    </div>
  );
}

export default function EventReviews() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reviewData, setReviewData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    getAllEvents({ organizerUser: user._id })
      .then((res) => {
        setMyEvents(res.data);
        if (res.data.length > 0) setSelectedEventId(res.data[0]._id);
      })
      .catch(() => setMyEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [user._id]);

  const fetchReviews = useCallback(async (eventId) => {
    if (!eventId) return;
    setLoadingReviews(true);
    try {
      const res = await getEventReviews(eventId);
      setReviewData(res.data);
    } catch {
      setReviewData({ reviews: [], averageRating: 0, totalReviews: 0 });
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchReviews(selectedEventId);
  }, [selectedEventId, fetchReviews]);

  const { reviews, averageRating, totalReviews } = reviewData;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fadeInDown">
          <h1 className="page-title">Event Reviews</h1>
          <p className="page-subtitle">See what attendees are saying about your events.</p>
        </div>

        {/* Event selector */}
        <div className="attendees-header animate-fadeInDown delay-100">
          <div className="attendees-event-select">
            <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Select Event</label>
            {loadingEvents ? (
              <div className="skeleton" style={{ height: 44, borderRadius: 'var(--r)' }} />
            ) : myEvents.length === 0 ? (
              <div style={{ color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                No events yet. <a href="/organizer/create" style={{ color: 'var(--c-purple-400)' }}>Create one →</a>
              </div>
            ) : (
              <select className="form-input" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                {myEvents.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            )}
          </div>

          {selectedEventId && !loadingReviews && (
            <AverageRatingBadge avg={averageRating} total={totalReviews} />
          )}
        </div>

        {/* Reviews list */}
        <div className="profile-section animate-fadeInUp">
          {loadingReviews ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No reviews yet</h3>
              <p>
                {myEvents.length === 0
                  ? 'Create an event first to receive reviews.'
                  : 'No one has reviewed this event yet. Share your event to get feedback!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.map((review) => {
                const name = review.user
                  ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || review.user.username
                  : 'Anonymous';
                const avatarUrl = review.user?.profileImage
                  ? `${API_BASE}/files/profile-pictures/${review.user.profileImage}`
                  : null;

                return (
                  <div key={review._id} style={{ padding: '1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div className="attendee-avatar" style={{ flexShrink: 0 }}>{getInitials(review.user)}</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>@{review.user?.username}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--c-text3)' }}>{formatDate(review.createdAt)}</span>
                        </div>
                        <div style={{ marginBottom: '0.4rem' }}>
                          <StarDisplay value={review.rating} />
                        </div>
                        {review.comment && (
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--c-text2)', lineHeight: 1.5 }}>{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
