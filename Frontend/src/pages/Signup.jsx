import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const STEPS = ['Account Type', 'Basic Info', 'Personal Details'];

export default function Signup() {
  const { signup, loading } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    role: 'Customer', username: '', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: '', birthDate: '', gender: 'Female',
    city: '', country: '', phoneNumber: '',
    organizerProfile: { companyName: '', companyAddress: '', website: '', taxId: '' },
  });

  const isOrganizer = form.role === 'EventOrganizer';

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const setOrg = (name, value) => {
    setForm((f) => ({ ...f, organizerProfile: { ...f.organizerProfile, [name]: value } }));
    setError('');
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!form.username || !form.email || !form.password) { setError('Username, email and password are required.'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
      setStep(2);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOrganizer && (!form.organizerProfile.companyName || !form.organizerProfile.companyAddress)) {
      setError('Company name and address are required for organizers.');
      return;
    }
    const { confirmPassword, ...payload } = form;
    const result = await signup(payload);
    if (result.success) {
      success(`Welcome to Eventify, ${result.user.firstName || result.user.username}! 🎉`);
      navigate(isOrganizer ? '/organizer/my-events' : '/events', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card animate-scaleIn" style={{ maxWidth: 520 }}>
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <span>Eventify</span>
        </Link>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: i <= step ? 'var(--c-purple-500)' : 'var(--c-border)', transition: 'background 0.3s' }} />
              <div style={{ fontSize: '0.68rem', color: i === step ? 'var(--c-purple-400)' : 'var(--c-text3)', marginTop: '0.3rem', fontWeight: i === step ? 600 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        <h1 className="auth-title">
          {step === 0 ? 'Create your account' : step === 1 ? 'Account credentials' : 'Your details'}
        </h1>
        <p className="auth-subtitle">
          {step === 0 ? 'How will you use Eventify?' : step === 1 ? 'Set up your login info' : isOrganizer ? 'Tell us about your organization' : 'A bit more about you'}
        </p>

        {error && <div className="auth-error animate-fadeInDown" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* STEP 0 — Role */}
          {step === 0 && (
            <div className="auth-form">
              <div className="role-selector">
                {[
                  { value: 'Customer', label: 'Attendee', desc: 'Discover and book events', icon: '🎟' },
                  { value: 'EventOrganizer', label: 'Organizer', desc: 'Create and manage events', icon: '🎪' },
                ].map((r) => (
                  <label key={r.value} className="role-option">
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={(e) => set('role', e.target.value)} />
                    <div className="role-label">
                      <div className="role-icon">{r.icon}</div>
                      <div className="role-name">{r.label}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleNext} style={{ marginTop: '0.5rem' }}>Continue →</button>
            </div>
          )}

          {/* STEP 1 — Credentials */}
          {step === 1 && (
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" placeholder="ahmed_m" value={form.username} onChange={(e) => set('username', e.target.value)} required autoComplete="username" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input className="form-input" placeholder="Ahmed" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input className="form-input" placeholder="Mostafa" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email address *</label>
                <input type="email" className="form-input" placeholder="ahmed@gmail.com" value={form.email} onChange={(e) => set('email', e.target.value)} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password *</label>
                <input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleNext}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 2 — Details */}
          {step === 2 && (
            <div className="auth-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Birth date</label>
                  <input type="date" className="form-input" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="Cairo" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" placeholder="Egypt" value={form.country} onChange={(e) => set('country', e.target.value)} />
                </div>
              </div>

              {isOrganizer && (
                <>
                  <div className="auth-divider" style={{ margin: '0.5rem 0' }}>Organization Info</div>
                  <div className="form-group">
                    <label className="form-label">Company name *</label>
                    <input className="form-input" placeholder="Nile Events Co." value={form.organizerProfile.companyName} onChange={(e) => setOrg('companyName', e.target.value)} required={isOrganizer} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company address *</label>
                    <input className="form-input" placeholder="5 Tahrir Square, Cairo" value={form.organizerProfile.companyAddress} onChange={(e) => setOrg('companyAddress', e.target.value)} required={isOrganizer} />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input className="form-input" placeholder="https://…" value={form.organizerProfile.website} onChange={(e) => setOrg('website', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tax ID</label>
                      <input className="form-input" value={form.organizerProfile.taxId} onChange={(e) => setOrg('taxId', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Creating…</> : 'Create Account 🎉'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
