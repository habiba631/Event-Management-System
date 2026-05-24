import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getInitials(user) {
  if (!user) return '?';
  const f = user.firstName?.[0] || '';
  const l = user.lastName?.[0] || '';
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
}

function NavAvatar({ user }) {
  if (user?.profileImage) {
    return (
      <img
        src={`${API_BASE}/files/profile-pictures/${user.profileImage}`}
        alt="avatar"
        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return <div className="navbar-avatar">{getInitials(user)}</div>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/');
  };

  const isOrganizer = user?.role === 'EventOrganizer';
  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const organizerLinks = isOrganizer ? [
    { to: '/organizer/my-events', label: 'My Events' },
    { to: '/organizer/create', label: 'Create Event' },
    { to: '/organizer/attendees', label: 'Attendees' },
  ] : [];

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">✦</div>
            <span>Eventify</span>
          </Link>

          <div className="navbar-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/events" className={isActive('/events')}>Events</Link>
            {isOrganizer && organizerLinks.map((l) => (
              <Link key={l.to} to={l.to} className={isActive(l.to)}>{l.label}</Link>
            ))}
          </div>

          <div className="navbar-actions">
            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <NavAvatar user={user} />
                  <span>{user.firstName || user.username}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--c-text3)' }}>▾</span>
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div style={{ padding: '0.4rem 0.8rem 0.6rem', borderBottom: '1px solid var(--c-border)', marginBottom: '0.3rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>{user.email}</div>
                    </div>
                    {isOrganizer ? (
                      <Link to="/organizer/profile" className="navbar-dropdown-item">
                        <span>👤</span> Profile
                      </Link>
                    ) : (
                      <Link to="/profile" className="navbar-dropdown-item">
                        <span>👤</span> Profile
                      </Link>
                    )}
                    {isOrganizer && (
                      <>
                        <Link to="/organizer/my-events" className="navbar-dropdown-item">
                          <span>📅</span> My Events
                        </Link>
                        <Link to="/organizer/create" className="navbar-dropdown-item">
                          <span>➕</span> Create Event
                        </Link>
                        <Link to="/organizer/attendees" className="navbar-dropdown-item">
                          <span>👥</span> Attendees
                        </Link>
                      </>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button className="navbar-dropdown-item danger" onClick={handleLogout} style={{ width: '100%', background: 'none', font: 'inherit', textAlign: 'left', border: 'none' }}>
                      <span>🚪</span> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="menu">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/events" className="navbar-link">Events</Link>
        {isOrganizer && organizerLinks.map((l) => (
          <Link key={l.to} to={l.to} className="navbar-link">{l.label}</Link>
        ))}
        <div className="mobile-divider" />
        {user ? (
          <>
            <Link to={isOrganizer ? '/organizer/profile' : '/profile'} className="navbar-link">Profile</Link>
            <button className="navbar-link" style={{ background: 'none', border: 'none', color: 'var(--c-error)', textAlign: 'left', font: 'inherit', cursor: 'pointer' }} onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign in</Link>
            <Link to="/signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get started</Link>
          </>
        )}
      </div>
    </>
  );
}
