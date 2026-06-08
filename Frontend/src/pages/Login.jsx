import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const { login, loading } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) { setError('Please fill in all fields.'); return; }
    const result = await login(form);
    if (result.success) {
      success(`Welcome back, ${result.user.firstName || result.user.username}! 👋`);
      const dest = result.user.role === 'EventOrganizer' ? '/organizer/my-events' : from;
      navigate(dest, { replace: true });
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

      <div className="auth-card animate-scaleIn">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <span>Eventify</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="auth-error animate-fadeInDown">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or username</label>
            <input
              type="text" name="identifier" className="form-input"
              placeholder="ahmed@gmail.com or ahmed_m"
              value={form.identifier} onChange={handleChange} required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="••••••••"
              value={form.password} onChange={handleChange} required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign in →'}
          </button>
        </form>

        <div className="auth-link-row">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
