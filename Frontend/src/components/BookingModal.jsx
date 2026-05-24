import { useState } from 'react';
import { createBooking } from '../api/bookings';
import { useToast } from './Toast';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BookingModal({ event, onClose, onSuccess }) {
  const { success, error } = useToast();
  const [ticketCount, setTicketCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const seatsLeft = event.seatsLeft ?? Math.max(0, event.capacity - event.registrations);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createBooking({ event: event._id, ticketCount, notes });
      success(`Booking confirmed! 🎉 ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for "${event.title}"`);
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Book Tickets</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Event summary */}
          <div style={{ padding: '1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{event.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📅</span> {formatDate(event.startsAt)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📍</span> {event.location}{event.city ? `, ${event.city}` : ''}
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🎟</span>
                <span style={{ color: seatsLeft < 10 ? 'var(--c-warning)' : 'var(--c-success)' }}>
                  {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available
                </span>
              </div>
            </div>
          </div>

          <form id="booking-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Number of Tickets</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary btn-sm"
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 'var(--r)', flexShrink: 0 }}
                  onClick={() => setTicketCount((c) => Math.max(1, c - 1))}>−</button>
                <input
                  type="number" min={1} max={Math.min(seatsLeft, 10)}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.min(seatsLeft, Math.max(1, Number(e.target.value))))}
                  className="form-input" style={{ textAlign: 'center', maxWidth: 80 }}
                />
                <button type="button" className="btn btn-secondary btn-sm"
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 'var(--r)', flexShrink: 0 }}
                  onClick={() => setTicketCount((c) => Math.min(seatsLeft, c + 1))}>+</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-input"
                placeholder="Any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button form="booking-form" type="submit" className="btn btn-primary" disabled={loading || seatsLeft < 1}>
            {loading ? <><span className="spinner spinner-sm" /> Booking…</> : `Confirm ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
