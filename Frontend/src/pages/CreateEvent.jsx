import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Music', 'Sports', 'Technology', 'Arts', 'Food', 'Business', 'Health', 'Education', 'Other'];
const STATUSES = ['draft', 'open'];

const CATEGORY_EMOJI = { Music:'🎵', Sports:'⚽', Technology:'💻', Arts:'🎨', Food:'🍕', Business:'💼', Health:'🏃', Education:'📚', Other:'✨', '':'✨' };

function formatPreviewDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreateEvent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: '', startsAt: '', endsAt: '',
    location: '', city: '', country: '',
    organizer: user?.organizerProfile?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '',
    capacity: 50, status: 'draft', imageUrl: '', price: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent({
        ...form,
        capacity: Number(form.capacity),
        price: form.price !== '' ? Math.round(parseFloat(form.price) * 100) : 0,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      });
      success('Event created successfully! 🎉');
      navigate('/organizer/my-events');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  const previewGradient = form.category
    ? { Music:'linear-gradient(135deg,#7c3aed,#ec4899)', Sports:'linear-gradient(135deg,#0ea5e9,#10b981)', Technology:'linear-gradient(135deg,#6366f1,#06b6d4)', Arts:'linear-gradient(135deg,#f59e0b,#ef4444)', Food:'linear-gradient(135deg,#f97316,#fbbf24)', Business:'linear-gradient(135deg,#3b82f6,#6d28d9)', Health:'linear-gradient(135deg,#10b981,#06b6d4)', Education:'linear-gradient(135deg,#8b5cf6,#3b82f6)' }[form.category] || 'linear-gradient(135deg,#7c3aed,#ec4899)'
    : 'linear-gradient(135deg,#7c3aed,#ec4899)';

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fadeInDown">
          <h1 className="page-title">Create New Event</h1>
          <p className="page-subtitle">Fill in the details below to publish your event.</p>
        </div>

        <div className="create-event-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div className="profile-section animate-fadeInUp">
              <h3 className="profile-section-title" style={{ marginBottom: '1.25rem' }}>Basic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Event title *</label>
                  <input name="title" className="form-input" placeholder="e.g. Cairo Jazz Night at Sawy Culture Wheel" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" placeholder="Describe the experience — artists, agenda, venue vibe, dress code..." value={form.description} onChange={handleChange} rows={4} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s === 'draft' ? 'Draft (private)' : 'Open (public)'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section animate-fadeInUp delay-100">
              <h3 className="profile-section-title" style={{ marginBottom: '1.25rem' }}>Date & Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Starts at *</label>
                    <input type="datetime-local" name="startsAt" className="form-input" value={form.startsAt} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ends at</label>
                    <input type="datetime-local" name="endsAt" className="form-input" value={form.endsAt} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Venue / Location *</label>
                  <input name="location" className="form-input" placeholder="e.g. Cairo Opera House" value={form.location} onChange={handleChange} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" placeholder="Cairo" value={form.city} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input name="country" className="form-input" placeholder="Egypt" value={form.country} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section animate-fadeInUp delay-200">
              <h3 className="profile-section-title" style={{ marginBottom: '1.25rem' }}>Capacity & Organizer</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input type="number" name="capacity" className="form-input" value={form.capacity} onChange={handleChange} min={1} required />
                    <span className="form-hint">Maximum number of attendees</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organizer display name *</label>
                    <input name="organizer" className="form-input" value={form.organizer} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ticket Price</label>
                  <input type="number" name="price" className="form-input" placeholder="0.00 for free" value={form.price} onChange={handleChange} min="0" step="0.01" />
                  <span className="form-hint">Leave empty or 0 for a free event</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Cover image URL (optional)</label>
                  <input name="imageUrl" className="form-input" placeholder="https://images.unsplash.com/…" value={form.imageUrl} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/organizer/my-events')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" /> Creating…</> : '✦ Publish Event'}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="create-event-preview animate-fadeInRight">
            <div className="create-preview-img" style={{ background: form.imageUrl ? 'var(--c-bg3)' : previewGradient }}>
              {form.imageUrl
                ? <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                : <span>{CATEGORY_EMOJI[form.category] || '✨'}</span>
              }
            </div>
            <div className="create-preview-body">
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-purple-400)', marginBottom: '0.4rem' }}>Live Preview</p>
              <div className="create-preview-title">{form.title || 'Your Event Title'}</div>
              <div className="create-preview-meta">
                {form.category && <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>{form.category}</span>}
                <div className="create-preview-row"><span>📅</span> {formatPreviewDate(form.startsAt)}</div>
                {form.location && <div className="create-preview-row"><span>📍</span> {form.location}{form.city ? `, ${form.city}` : ''}</div>}
                <div className="create-preview-row"><span>👥</span> {form.capacity} capacity</div>
                {form.status && <div className="create-preview-row"><span>🔖</span> Status: {form.status}</div>}
              </div>
              {form.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--c-text2)', marginTop: '0.75rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
