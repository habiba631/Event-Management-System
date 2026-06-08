import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { updateSelf, uploadProfilePicture as apiUploadProfilePicture, fetchTaxRegistry } from '../api/users';

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

export default function OrganizerProfile() {
  const { user, updateUserData } = useAuth();
  const { success, error } = useToast();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [picturePreview, setPicturePreview] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const pictureInputRef = useRef(null);

  const [taxRegistryPreviewUrl, setTaxRegistryPreviewUrl] = useState(null);
  const [loadingTaxRegistry, setLoadingTaxRegistry] = useState(false);
  const [taxRegistryError, setTaxRegistryError] = useState(false);

  const taxRegistryId = user?.organizerProfile?.taxRegistry;

  useEffect(() => {
    if (!taxRegistryId) {
      setTaxRegistryPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    setLoadingTaxRegistry(true);
    setTaxRegistryError(false);
    fetchTaxRegistry(taxRegistryId)
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setTaxRegistryPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setTaxRegistryPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setTaxRegistryError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTaxRegistry(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [taxRegistryId]);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });

  const [orgForm, setOrgForm] = useState({
    companyName: user?.organizerProfile?.companyName || '',
    companyAddress: user?.organizerProfile?.companyAddress || '',
    website: user?.organizerProfile?.website || '',
    taxId: user?.organizerProfile?.taxId || '',
    eventTags: user?.organizerProfile?.eventTags || [],
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleOrgChange = (e) => setOrgForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleTag = (tag) => {
    setOrgForm((f) => ({
      ...f,
      eventTags: f.eventTags.includes(tag) ? f.eventTags.filter((t) => t !== tag) : [...f.eventTags, tag],
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
      const res = await updateSelf({ ...form, organizerProfile: orgForm });
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

  const profilePictureUrl = getProfilePictureUrl(user?.profileImage);

  const handleOpenTaxRegistry = () => {
    if (taxRegistryPreviewUrl) {
      window.open(taxRegistryPreviewUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
              <span className="badge badge-purple">Event Organizer</span>
            </div>
            {user?.organizerProfile?.isVerified && (
              <div style={{ marginTop: '0.4rem' }}><span className="badge badge-green">✓ Verified</span></div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--c-text3)', marginTop: '0.4rem' }}>{user?.email}</div>

            <nav className="profile-nav">
              {[
                { key: 'profile', icon: '👤', label: 'Profile' },
                { key: 'organization', icon: '🏢', label: 'Organization' },
              ].map((item) => (
                <button key={item.key} className={`profile-nav-item${tab === item.key ? ' active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setTab(item.key)}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--c-glass)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Links</div>
              <a href="/organizer/create" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-purple-400)', marginBottom: '0.3rem' }}>➕ Create Event</a>
              <a href="/organizer/my-events" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-purple-400)', marginBottom: '0.3rem' }}>📅 My Events</a>
              <a href="/organizer/attendees" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-purple-400)' }}>👥 Attendees</a>
            </div>
          </aside>

          {/* Main */}
          <div className="profile-main animate-fadeInRight">
            {saveSuccess && <div className="profile-success">✓ Profile updated successfully!</div>}

            <form onSubmit={handleSave}>
              {tab === 'profile' && (
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
                      <label className="form-label">Phone</label>
                      <input name="phoneNumber" className="form-input" value={form.phoneNumber} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input name="city" className="form-input" value={form.city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Country</label>
                      <input name="country" className="form-input" value={form.country} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Bio</label>
                      <textarea name="bio" className="form-input" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell attendees about yourself…" />
                    </div>
                  </div>
                </div>
              )}

              {tab === 'organization' && (
                <>
                  <div className="profile-section">
                    <div className="profile-section-header">
                      <h2 className="profile-section-title">Organization Details</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Company name *</label>
                        <input name="companyName" className="form-input" value={orgForm.companyName} onChange={handleOrgChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tax ID</label>
                        <input name="taxId" className="form-input" value={orgForm.taxId} onChange={handleOrgChange} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="form-label">Company address *</label>
                        <input name="companyAddress" className="form-input" value={orgForm.companyAddress} onChange={handleOrgChange} required />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="form-label">Website</label>
                        <input name="website" className="form-input" placeholder="https://…" value={orgForm.website} onChange={handleOrgChange} />
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Event specializations</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {TAGS.map((tag) => (
                          <button key={tag} type="button"
                            className={`filter-chip${orgForm.eventTags.includes(tag) ? ' active' : ''}`}
                            onClick={() => toggleTag(tag)}>
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-header">
                      <h2 className="profile-section-title">Tax Registry</h2>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--c-text2)', marginBottom: '1rem' }}>
                      Your tax registry document was submitted during registration.
                    </p>

                    {taxRegistryId ? (
                      <div className="tax-registry-viewer">
                        <div className="tax-registry-viewer-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📄</span>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tax registry on file</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>Submitted at signup</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleOpenTaxRegistry}
                            disabled={!taxRegistryPreviewUrl || loadingTaxRegistry}
                          >
                            Open in new tab
                          </button>
                        </div>

                        {loadingTaxRegistry ? (
                          <div className="tax-registry-viewer-loading">
                            <span className="spinner spinner-sm" /> Loading document…
                          </div>
                        ) : taxRegistryPreviewUrl ? (
                          <iframe
                            src={taxRegistryPreviewUrl}
                            title="Tax registry document"
                            className="tax-registry-preview"
                          />
                        ) : (
                          <div className="tax-registry-viewer-empty">
                            {taxRegistryError
                              ? 'Could not load your tax registry document.'
                              : 'Unable to preview this document.'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem', background: 'var(--c-glass)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', fontSize: '0.85rem', color: 'var(--c-text2)' }}>
                        No tax registry document on file.
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner spinner-sm" /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
