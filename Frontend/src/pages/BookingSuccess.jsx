import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getSessionStatus } from '../api/payments';

function formatPrice(cents) {
  return `EGP ${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [state, setState] = useState('loading'); // loadinCg | success | failed | cancelled
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/events', { replace: true });
      return;
    }

    getSessionStatus(sessionId)
      .then((res) => {
        setPayment(res.data);
        const s = res.data.status;
        setState(s === 'succeeded' ? 'success' : s === 'failed' ? 'failed' : 'cancelled');
      })
      .catch(() => setState('failed'));
  }, [sessionId]);

  if (state === 'loading') {
    return (
      <div className="page">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
          <span className="spinner" style={{ width: 40, height: 40 }} />
          <p style={{ color: 'var(--c-text2)' }}>Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    const event = payment?.event;
    const booking = payment?.booking;
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 540, margin: '0 auto', paddingTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
            <p style={{ color: 'var(--c-text2)' }}>Your payment was successful and your tickets are confirmed.</p>
          </div>

          {event && (
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{event.title}</div>
              {event.startsAt && (
                <div style={{ fontSize: '0.82rem', color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📅</span> {formatDate(event.startsAt)}
                </div>
              )}
              {event.location && (
                <div style={{ fontSize: '0.82rem', color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📍</span> {event.location}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--c-text2)' }}>
                  {booking?.ticketCount ?? 1} ticket{(booking?.ticketCount ?? 1) > 1 ? 's' : ''}
                </span>
                <span style={{ fontWeight: 700 }}>{formatPrice(payment.amount)}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/profile" className="btn btn-primary">View My Bookings</Link>
            <Link to="/events" className="btn btn-secondary">Browse Events</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{state === 'failed' ? '❌' : '↩️'}</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Payment {state === 'failed' ? 'Failed' : 'Cancelled'}</h1>
        <p style={{ color: 'var(--c-text2)' }}>
          {state === 'failed'
            ? 'Your payment could not be processed. No charge was made.'
            : 'Your booking was cancelled and no charge was made.'}
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      </div>
    </div>
  );
}
