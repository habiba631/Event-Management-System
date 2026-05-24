import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { updateSelf, uploadProfilePicture as apiUploadProfilePicture } from '../api/users';
import { getAllBookings, deleteBooking } from '../api/bookings';
import { useEffect } from 'react';

const TAGS = ['Music', 'Sports', 'Technology', 'Arts', 'Food', 'Business', 'Health', 'Education'];

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

function getProfilePictureUrl(profileImage) {
  if (!profileImage) return null;
  return `${API_BASE}/files/profile-pictures/${profileImage}`;
}

function getInitials(user) {
  const f = user?.firstName?.[0] || '';
  const l = user?.lastName?.[0] || '';
  return (f + l).toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export default function CustomerProfile() {
  const { user, updateUserData } = useAuth();
  const { success, error } = useToast();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [picturePreview, setPicturePreview] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const pictureInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    birthDate: user?.birthDate ? user.birthDate.slice(0, 10) : '',
    gender: user?.gender || 'Female',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    preferences: user?.preferences || [],
  });

  useEffect(() => {
    if (tab === 'bookings') {
      setLoadingBookings(true);
      getAllBookings().then((res) => setBookings(res.data)).catch(() => setBookings([])).finally(() => setLoadingBookings(false));
    }
  }, [tab]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const togglePreference = (tag) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(tag)
        ? f.preferences.filter((t) => t !== tag)
        : [...f.preferences, tag],
    }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handlePictureUpload = async () => {
    if (!pictureFile) return;
    setUploadingPicture(true);
    try {
      const res = await apiUploadProfilePicture(pictureFile);
      updateUserData(res.data.user);
      setPictureFile(null);
      setPicturePreview(null);
      success('Profile picture updated!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload picture.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await updateSelf(form);
      updateUserData(res.data.user);
      setSaveSuccess(true);
      success('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await deleteBooking(bookingId);
      setBookings((b) => b.filter((bk) => bk._id !== bookingId));
      success('Booking cancelled.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const profilePictureUrl = getProfilePictureUrl(user?.profileImage);

  return (
    <div className="page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar animate-fadeInLeft">
            <div className="profile-avatar-wrap" style={{ position: 'relative' }}>
              {picturePreview || profilePictureUrl ? (
                <img
                  src={picturePreview || profilePictureUrl}
                  alt="Profile"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--c-border)' }}
                />
              ) : (
                <div className="profile-avatar">{getInitials(user)}</div>
              )}
              <button
                type="button"
                onClick={() => pictureInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--c-purple-500)', border: 'none', borderRadius: '50%',
                  width: '26px', height: '26px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: '#fff',
                }}
                title="Change photo"
              >
                ✎
              </button>
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePictureChange}
              />
            </div>

            {pictureFile && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem', width: '100%' }}
                onClick={handlePictureUpload}
                disabled={uploadingPicture}
              >
                {uploadingPicture ? <><span className="spinner spinner-sm" /> Uploading…</> : 'Upload Photo'}
              </button>
            )}

            <div className="profile-name">{user?.firstName} {user?.lastName}</div>
            <div className="profile-role">
              <span className="badge badge-purple">Customer</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--c-text3)', marginTop: '0.25rem' }}>{user?.email}</div>
            <nav className="profile-nav">
              {[
                { key: 'profile', icon: '👤', label: 'Profile' },
                { key: 'bookings', icon: '🎟', label: 'My Bookings' },
              ].map((item) => (
                <button key={item.key} className={`profile-nav-item${tab === item.key ? ' active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setTab(item.key)}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="profile-main animate-fadeInRight">
            {tab === 'profile' && (
              <form onSubmit={handleSave}>
                {saveSuccess && <div className="profile-success">✓ Profile updated successfully!</div>}

                <div className="profile-section">
                  <div className="profile-section-header">
                    <h2 className="profile-section-title">Personal Information</h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First name</label>
                      <input name="firstName" className="form-input" value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last name</label>
                      <input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input name="username" className="form-input" value={form.username} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone number</label>
                      <input name="phoneNumber" className="form-input" value={form.phoneNumber} onChange={handleChange} placeholder="+20 100 000 0000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Birth date</label>
                      <input name="birthDate" type="date" className="form-input" value={form.birthDate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input name="city" className="form-input" value={form.city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Country</label>
                      <input name="country" className="form-input" value={form.country} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Bio</label>
                      <textarea name="bio" className="form-input" value={form.bio} onChange={handleChange} placeholder="Tell us a little about yourself…" rows={3} />
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="profile-section-header">
                    <h2 className="profile-section-title">Interests</h2>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text2)', marginBottom: '1rem' }}>Select topics you're interested in to get personalised recommendations.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {TAGS.map((tag) => (
                      <button key={tag} type="button"
                        className={`filter-chip${form.preferences.includes(tag) ? ' active' : ''}`}
                        onClick={() => togglePreference(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner spinner-sm" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'bookings' && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h2 className="profile-section-title">My Bookings</h2>
                  <span className="badge badge-purple">{bookings.length}</span>
                </div>
                {loadingBookings ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
                ) : bookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎟</div>
                    <h3>No bookings yet</h3>
                    <p>Browse events and book your first experience.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.map((bk) => (
                      <div key={bk._id} style={{ padding: '1rem', background: 'var(--c-glass)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{bk.event?.title || 'Unknown Event'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span>📅 {formatDate(bk.event?.startsAt)}</span>
                            <span>🎟 {bk.ticketCount} ticket{bk.ticketCount > 1 ? 's' : ''}</span>
                            <span>Booked {formatDate(bk.createdAt)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${bk.status === 'confirmed' ? 'badge-green' : bk.status === 'cancelled' ? 'badge-red' : 'badge-amber'}`}>{bk.status}</span>
                          {bk.status !== 'cancelled' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(bk._id)}>Cancel</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
