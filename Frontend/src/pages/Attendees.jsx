import { useState, useEffect, useCallback } from 'react';
import { getAllEvents } from '../api/events';
import { getAllBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export default function Attendees() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    getAllEvents({ organizerUser: user._id }).then((res) => {
      setMyEvents(res.data);
      if (res.data.length > 0) setSelectedEventId(res.data[0]._id);
    }).catch(() => setMyEvents([])).finally(() => setLoadingEvents(false));
  }, [user._id]);

  const fetchBookings = useCallback(async (eventId) => {
    if (!eventId) return;
    setLoadingBookings(true);
    try {
      const res = await getAllBookings({ event: eventId });
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchBookings(selectedEventId);
  }, [selectedEventId, fetchBookings]);

  const selectedEvent = myEvents.find((e) => e._id === selectedEventId);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalTickets = bookings.filter((b) => b.status === 'confirmed').reduce((acc, b) => acc + b.ticketCount, 0);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fadeInDown">
          <h1 className="page-title">Event Attendees</h1>
          <p className="page-subtitle">View who's attending your events.</p>
        </div>

        {/* Event selector */}
        <div className="attendees-header animate-fadeInDown delay-100">
          <div className="attendees-event-select">
            <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Select Event</label>
            {loadingEvents ? (
              <div className="skeleton" style={{ height: 44, borderRadius: 'var(--r)' }} />
            ) : myEvents.length === 0 ? (
              <div style={{ color: 'var(--c-text2)', fontSize: '0.9rem' }}>No events yet. <a href="/organizer/create" style={{ color: 'var(--c-purple-400)' }}>Create one →</a></div>
            ) : (
              <select className="form-input" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                {myEvents.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            )}
          </div>

          {selectedEvent && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{confirmedCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendees</div>
              </div>
              <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{totalTickets}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tickets</div>
              </div>
              <div style={{ padding: '0.6rem 1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-emerald)' }}>{selectedEvent.capacity ? Math.round((selectedEvent.registrations / selectedEvent.capacity) * 100) : 0}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filled</div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings table */}
        <div className="profile-section animate-fadeInUp">
          {loadingBookings ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner spinner-lg" /></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No attendees yet</h3>
              <p>
                {myEvents.length === 0
                  ? 'Create an event first to see attendees.'
                  : 'No bookings for this event yet. Share your event to get attendees!'}
              </p>
            </div>
          ) : (
            <div className="attendees-table-wrap">
              <table className="attendees-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Email</th>
                    <th>Tickets</th>
                    <th>Status</th>
                    <th>Booked On</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((bk) => {
                    const name = bk.user ? `${bk.user.firstName || ''} ${bk.user.lastName || ''}`.trim() || bk.user.username : 'Unknown';
                    return (
                      <tr key={bk._id}>
                        <td>
                          <div className="attendee-user">
                            <div className="attendee-avatar">{getInitials(name)}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>@{bk.user?.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--c-text2)' }}>{bk.user?.email || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{bk.ticketCount}</td>
                        <td>
                          <span className={`badge ${bk.status === 'confirmed' ? 'badge-green' : bk.status === 'cancelled' ? 'badge-red' : 'badge-amber'}`}>
                            {bk.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--c-text2)' }}>{formatDate(bk.createdAt)}</td>
                        <td style={{ color: 'var(--c-text2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bk.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
