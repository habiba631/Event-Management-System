import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cancelSession } from '../api/payments';

export default function BookingCancel() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const cancelled = useRef(false);

  useEffect(() => {
    if (!sessionId || cancelled.current) return;
    cancelled.current = true;
    // Fire-and-forget — expire the session and free the booking slot
    cancelSession(sessionId).catch(() => {});
  }, [sessionId]);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>↩️</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Payment Cancelled</h1>
        <p style={{ color: 'var(--c-text2)' }}>
          You cancelled the checkout. No charge was made and your booking slot has been released.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/events" className="btn btn-primary">Back to Events</Link>
        </div>
      </div>
    </div>
  );
}
