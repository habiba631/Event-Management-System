import { useAuth } from '../context/AuthContext';

const CATEGORY_GRADIENTS = {
  Music:       'linear-gradient(135deg,#7c3aed,#ec4899)',
  Sports:      'linear-gradient(135deg,#0ea5e9,#10b981)',
  Technology:  'linear-gradient(135deg,#6366f1,#06b6d4)',
  Arts:        'linear-gradient(135deg,#f59e0b,#ef4444)',
  Food:        'linear-gradient(135deg,#f97316,#fbbf24)',
  Business:    'linear-gradient(135deg,#3b82f6,#6d28d9)',
  Health:      'linear-gradient(135deg,#10b981,#06b6d4)',
  Education:   'linear-gradient(135deg,#8b5cf6,#3b82f6)',
  Default:     'linear-gradient(135deg,#7c3aed,#ec4899)',
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name) {
  return name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
}

export default function EventCard({ event, onBook, onEdit }) {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'EventOrganizer';
  const isOwner = isOrganizer && String(event.organizerUser) === String(user?._id);

  const gradient = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.Default;
  const emoji = CATEGORY_EMOJIS[event.category] || CATEGORY_EMOJIS.Default;
  const status = STATUS_BADGE[event.status] || STATUS_BADGE.draft;
  const seatsLeft = event.seatsLeft ?? Math.max(0, event.capacity - event.registrations);
  const pctFilled = Math.min(100, Math.round((event.registrations / event.capacity) * 100));
  const seatsBarColor = pctFilled >= 90 ? '#ef4444' : pctFilled >= 60 ? '#f59e0b' : '#10b981';

  return (
    <div className="event-card" onClick={isOwner && onEdit ? () => onEdit(event) : undefined}>
      <div className="event-card-img" style={{ background: gradient }}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem' }}>{emoji}</span>
        }
        <div className="event-card-img-overlay" />
      </div>

      <div className="event-card-body">
        <div className="event-card-badges">
          <span className={`badge badge-purple`}>{event.category}</span>
          <span className={`badge ${status.cls}`}>{status.label}</span>
          <span className={`badge ${(event.price ?? 0) === 0 ? 'badge-green' : 'badge-amber'}`}>
            {(event.price ?? 0) === 0 ? 'Free' : `EGP ${(event.price / 100).toFixed(2)}`}
          </span>
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-meta">
          <div className="event-card-meta-row">
            <svg className="event-card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          </div>
          <div className="event-card-meta-row">
            <svg className="event-card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {event.location}{event.city ? `, ${event.city}` : ''}
          </div>
        </div>

        <div className="event-card-seats">
          <div className="seats-bar-wrap">
            <span>{seatsLeft} seats left</span>
            <div className="seats-bar">
              <div className="seats-bar-fill" style={{ width: `${pctFilled}%`, background: seatsBarColor }} />
            </div>
            <span>{pctFilled}%</span>
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        <div className="event-organizer">
          <div className="event-organizer-avatar">{getInitials(event.organizer)}</div>
          <span>{event.organizer}</span>
        </div>

        {isOwner && onEdit ? (
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(event); }}>
            Manage
          </button>
        ) : user?.role === 'Customer' && onBook && event.status === 'open' && seatsLeft > 0 ? (
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onBook(event); }}>
            Book Now
          </button>
        ) : !user && event.status === 'open' ? (
          <span style={{ fontSize: '0.78rem', color: 'var(--c-text3)' }}>Login to book</span>
        ) : null}
      </div>
    </div>
  );
}
