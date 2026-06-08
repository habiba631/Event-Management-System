import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import EventCard from '../components/EventCard';
const CATEGORIES = ['All', 'Music', 'Sports', 'Technology', 'Arts', 'Food', 'Business', 'Health', 'Education', 'Other'];
const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'full', label: 'Full' },
  { value: 'completed', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const fetchEvents = useCallback(async (q, cat, st) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (cat && cat !== 'All') params.category = cat;
      if (st) params.status = st;
      const res = await getAllEvents(params);
      setEvents(res.data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(search, category, status);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search, category, status);
    setSearchParams({ ...(search && { q: search }), ...(category !== 'All' && { category }), ...(status && { status }) });
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    fetchEvents(search, cat, status);
  };

  const handleStatus = (e) => {
    const val = e.target.value;
    setStatus(val);
    fetchEvents(search, category, val);
  };

  return (
    <div className="events-page">
      <div className="container">
        {/* Hero */}
        <div className="events-hero animate-fadeInDown">
          <div className="section-tag" style={{ margin: '0 auto 0.75rem' }}>✦ All Events</div>
          <h1 className="section-title">Find Your Next Experience</h1>
          <p className="section-subtitle" style={{ margin: '0.75rem auto 0' }}>Browse events happening near you and around the world.</p>

          <form onSubmit={handleSearch}>
            <div className="events-search-bar">
              <span className="events-search-icon">🔍</span>
              <input
                className="events-search-input"
                placeholder="Search events, venues, organizers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="events-search-btn">Search</button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <div className="events-filters" style={{ margin: 0, flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`filter-chip${category === cat ? ' active' : ''}`} onClick={() => handleCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <select className="filter-select" value={status} onChange={handleStatus}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <p className="events-results-info animate-fadeIn">
          {loading ? 'Loading events…' : `${events.length} event${events.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="events-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="event-card" style={{ animationDelay: `${i*0.05}s` }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: 14, width: '50%' }} />
                  <div className="skeleton" style={{ height: 20 }} />
                  <div className="skeleton" style={{ height: 14, width: '75%' }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map((ev, i) => (
              <div key={ev._id} className="animate-fadeInUp" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state animate-fadeIn">
            <div className="empty-icon">🎭</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters to find something you love.</p>
          </div>
        )}
      </div>

    </div>
  );
}
