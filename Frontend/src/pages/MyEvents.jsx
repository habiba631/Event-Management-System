import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import { useAuth } from '../context/AuthContext';
import OrganizerEventModal from '../components/OrganizerEventModal';

const STATUS_COLOR = { open:'badge-green', draft:'badge-gray', full:'badge-amber', completed:'badge-gray', cancelled:'badge-red' };
const CATEGORY_EMOJI = { Music:'🎵', Sports:'⚽', Technology:'💻', Arts:'🎨', Food:'🍕', Business:'💼', Health:'🏃', Education:'📚', Other:'✨' };
const CATEGORY_GRADIENT = { Music:'linear-gradient(135deg,#7c3aed,#ec4899)', Sports:'linear-gradient(135deg,#0ea5e9,#10b981)', Technology:'linear-gradient(135deg,#6366f1,#06b6d4)', Arts:'linear-gradient(135deg,#f59e0b,#ef4444)', Food:'linear-gradient(135deg,#f97316,#fbbf24)', Business:'linear-gradient(135deg,#3b82f6,#6d28d9)', Health:'linear-gradient(135deg,#10b981,#06b6d4)', Education:'linear-gradient(135deg,#8b5cf6,#3b82f6)' };

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllEvents({ organizerUser: user._id });
      setEvents(res.data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredEvents = filter ? events.filter((e) => e.status === filter) : events;

  const handleUpdated = (updated) => setEvents((prev) => prev.map((e) => e._id === updated._id ? updated : e));
  const handleDeleted = (id) => setEvents((prev) => prev.filter((e) => e._id !== id));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fadeInDown" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link to="/organizer/create" className="btn btn-primary">✦ Create Event</Link>
        </div>

        {/* Status filter */}
        <div className="events-filters animate-fadeInDown delay-100">
          {['', 'open', 'draft', 'full', 'completed', 'cancelled'].map((s) => (
            <button key={s} className={`filter-chip${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="my-events-grid">
            {[1,2,3].map((i) => (
              <div key={i} className="my-event-card">
                <div className="skeleton" style={{ height: 140 }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: 16 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state animate-fadeIn">
            <div className="empty-icon">📅</div>
            <h3>{filter ? `No ${filter} events` : 'No events yet'}</h3>
            <p>{filter ? 'Try a different filter.' : 'Create your first event to get started.'}</p>
            {!filter && <Link to="/organizer/create" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Event →</Link>}
          </div>
        ) : (
          <div className="my-events-grid">
            {filteredEvents.map((ev, i) => {
              const grad = CATEGORY_GRADIENT[ev.category] || 'linear-gradient(135deg,#7c3aed,#ec4899)';
              const emoji = CATEGORY_EMOJI[ev.category] || '✨';
              const pct = Math.min(100, Math.round((ev.registrations / ev.capacity) * 100));
              return (
                <div key={ev._id} className="my-event-card animate-fadeInUp" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="my-event-img" style={{ background: ev.imageUrl ? 'var(--c-bg3)' : grad }}>
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span>{emoji}</span>
                    }
                    <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem' }}>
                      <span className={`badge ${STATUS_COLOR[ev.status] || 'badge-gray'}`}>{ev.status}</span>
                    </div>
                  </div>
                  <div className="my-event-body">
                    <div className="my-event-title">{ev.title}</div>
                    <div className="my-event-meta">
                      📅 {formatDate(ev.startsAt)} · 📍 {ev.location}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--c-text2)', marginBottom: '0.75rem' }}>
                      <span style={{ color: pct >= 90 ? 'var(--c-error)' : pct >= 60 ? 'var(--c-warning)' : 'var(--c-success)' }}>
                        {ev.registrations}/{ev.capacity}
                      </span> registered ({pct}%)
                    </div>
                    <div className="my-event-actions">
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setSelectedEvent(ev)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setSelectedEvent(ev); }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEvent && (
        <OrganizerEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
