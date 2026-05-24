import { useState, useEffect } from 'react';
import { updateEvent, deleteEvent } from '../api/events';
import { useToast } from './Toast';

const CATEGORIES = ['Music', 'Sports', 'Technology', 'Arts', 'Food', 'Business', 'Health', 'Education', 'Other'];
const STATUSES = ['draft', 'open', 'full', 'completed', 'cancelled'];

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrganizerEventModal({ event, onClose, onUpdated, onDeleted }) {
  const { success, error } = useToast();
  const [tab, setTab] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', startsAt: '', endsAt: '',
    location: '', city: '', country: '', organizer: '', capacity: 1,
    status: 'draft', imageUrl: '',
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        startsAt: toDatetimeLocal(event.startsAt),
        endsAt: toDatetimeLocal(event.endsAt),
        location: event.location || '',
        city: event.city || '',
        country: event.country || '',
        organizer: event.organizer || '',
        capacity: event.capacity || 1,
        status: event.status || 'draft',
        imageUrl: event.imageUrl || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateEvent(event._id, {
        ...form,
        capacity: Number(form.capacity),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      });
      success('Event updated successfully!');
      onUpdated?.(res.data);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEvent(event._id);
      success('Event deleted.');
      onDeleted?.(event._id);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Manage Event</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ paddingTop: 0 }}>
          <div className="modal-tabs">
            <button className={`modal-tab${tab === 'edit' ? ' active' : ''}`} onClick={() => setTab('edit')}>✏️ Edit Event</button>
            <button className={`modal-tab${tab === 'delete' ? ' active' : ''}`} onClick={() => setTab('delete')}>🗑 Delete Event</button>
          </div>

          {tab === 'edit' && (
            <form id="edit-form" onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" value={form.description} onChange={handleChange} rows={3} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Starts At *</label>
                  <input type="datetime-local" name="startsAt" className="form-input" value={form.startsAt} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ends At</label>
                  <input type="datetime-local" name="endsAt" className="form-input" value={form.endsAt} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input name="location" className="form-input" value={form.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input type="number" name="capacity" className="form-input" value={form.capacity} onChange={handleChange} min={1} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input name="imageUrl" className="form-input" placeholder="https://…" value={form.imageUrl} onChange={handleChange} />
              </div>
            </form>
          )}

          {tab === 'delete' && (
            <div className="delete-confirm">
              <div className="delete-confirm-icon">⚠️</div>
              <h3>Delete "{event?.title}"?</h3>
              <p>This action cannot be undone. All bookings for this event will remain in the system but the event will be permanently removed.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          {tab === 'edit' ? (
            <button form="edit-form" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Saving…</> : 'Save Changes'}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Deleting…</> : 'Delete Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
