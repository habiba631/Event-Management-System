import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getAdminStats } from '../api/admin';
import { getAllUsers, deleteUser } from '../api/users';
import { getAllEvents } from '../api/events';

/* ── helpers ──────────────────────────────────────────────── */
function fmt(cents) {
  return `EGP ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function shortDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* Fill in every day for the last N days, defaulting missing values to 0 */
function fillDays(data, key, days = 30) {
  const map = {};
  data.forEach((d) => { map[d.date] = d[key]; });
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const iso = dt.toISOString().slice(0, 10);
    result.push({ date: iso, label: shortDate(iso), value: map[iso] ?? 0 });
  }
  return result;
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, accent = 'var(--c-purple-500)', delay = 0 }) {
  return (
    <div
      className="animate-fadeInUp"
      style={{
        animationDelay: `${delay}s`,
        padding: '1.25rem 1.4rem',
        background: 'var(--gradient-card)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.22s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, lineHeight: 1, color: accent }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--c-text2)' }}>{sub}</div>}
    </div>
  );
}

/* ── Custom Tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, prefix = '', suffix = '', isCurrency = false }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: 'var(--c-bg3)', border: '1px solid var(--c-border)',
      borderRadius: 'var(--r)', padding: '0.6rem 0.9rem', fontSize: '0.82rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: 'var(--c-text3)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 700, color: 'var(--c-text)' }}>
        {isCurrency ? fmt(val) : `${prefix}${val.toLocaleString()}${suffix}`}
      </div>
    </div>
  );
}

/* ── Area chart wrapper ────────────────────────────────────── */
function TrendChart({ data, color, gradientId, isCurrency = false, title, subtitle }) {
  return (
    <div style={{
      padding: '1.4rem',
      background: 'var(--gradient-card)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-xl)',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--c-text3)', marginTop: '0.15rem' }}>{subtitle}</div>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: isCurrency ? 10 : 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--c-text3)' }}
            axisLine={false} tickLine={false}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--c-text3)' }}
            axisLine={false} tickLine={false} width={isCurrency ? 52 : 30}
            tickFormatter={isCurrency ? (v) => `${(v / 100).toFixed(0)}` : undefined}
          />
          <Tooltip content={<ChartTooltip isCurrency={isCurrency} />} />
          <Area
            type="monotone" dataKey="value"
            stroke={color} strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false} activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Bar chart (bookings) ──────────────────────────────────── */
function BookingsBarChart({ data }) {
  return (
    <div style={{
      padding: '1.4rem',
      background: 'var(--gradient-card)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-xl)',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>Bookings / Day</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--c-text3)', marginBottom: '1rem' }}>Last 30 days</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--c-text3)' }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--c-text3)' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip content={<ChartTooltip suffix=" bookings" />} />
          <Bar dataKey="value" fill="var(--c-cyan)" radius={[3, 3, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Export helpers ────────────────────────────────────────── */
function exportPDF(title, columns, rows, filename) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 60);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 140);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 23);
  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => c.accessor(r))),
    startY: 28,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    tableLineColor: [220, 215, 255],
    tableLineWidth: 0.1,
  });
  doc.save(filename);
}

function exportExcel(sheetName, columns, rows, filename) {
  const wb = XLSX.utils.book_new();
  const data = [
    columns.map((c) => c.header),
    ...rows.map((r) => columns.map((c) => c.accessor(r))),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  // Column widths
  ws['!cols'] = columns.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

const USER_COLS = [
  { header: 'Name',      accessor: (u) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username },
  { header: 'Username',  accessor: (u) => u.username },
  { header: 'Email',     accessor: (u) => u.email },
  { header: 'Role',      accessor: (u) => u.role },
  { header: 'City',      accessor: (u) => u.city || '—' },
  { header: 'Country',   accessor: (u) => u.country || '—' },
  { header: 'Status',    accessor: (u) => u.isActive ? 'Active' : 'Inactive' },
  { header: 'Joined',    accessor: (u) => fmtDate(u.createdAt) },
];

const EVENT_COLS = [
  { header: 'Title',      accessor: (e) => e.title },
  { header: 'Category',   accessor: (e) => e.category },
  { header: 'Organizer',  accessor: (e) => e.organizer },
  { header: 'Status',     accessor: (e) => e.status },
  { header: 'Date',       accessor: (e) => fmtDate(e.startsAt) },
  { header: 'Capacity',   accessor: (e) => e.capacity },
  { header: 'Registered', accessor: (e) => e.registrations },
  { header: 'Price',      accessor: (e) => e.price > 0 ? fmt(e.price) : 'Free' },
];

/* ── Reusable data table ───────────────────────────────────── */
function DataTable({ title, columns, rows, exportName, loading }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(c.accessor(r)).toLowerCase().includes(q))
    );
  }, [rows, search, columns]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(sortCol.accessor(a)).toLowerCase();
      const bv = String(sortCol.accessor(b)).toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
    }}>
      {/* Table header toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        padding: '1.1rem 1.4rem',
        borderBottom: '1px solid var(--c-border)',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</span>
          <span className="badge badge-purple" style={{ fontWeight: 700 }}>{filtered.length}</span>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'var(--c-bg3)', border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-full)', padding: '0.35rem 0.9rem',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--c-purple-500)'}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--c-border)'}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search…"
            value={search}
            onChange={handleSearch}
            style={{ background: 'none', border: 'none', color: 'var(--c-text)', fontSize: '0.82rem', width: 160, outline: 'none' }}
          />
        </div>

        {/* Export buttons */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => exportPDF(`${title} Report`, columns, filtered, `${exportName}.pdf`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          PDF
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => exportExcel(title, columns, filtered, `${exportName}.xlsx`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13h2l2 3 2-3h2" />
          </svg>
          Excel
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  onClick={() => handleSort(col)}
                  style={{
                    padding: '0.7rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: sortCol === col ? 'var(--c-purple-400)' : 'var(--c-text3)',
                    borderBottom: '1px solid var(--c-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    background: 'rgba(139,92,246,0.04)',
                    transition: 'color 0.15s',
                  }}
                >
                  {col.header}
                  {sortCol === col && (
                    <span style={{ marginLeft: '0.3rem', fontSize: '0.65rem' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.header} style={{ padding: '0.85rem 1rem' }}>
                      <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--c-text3)', fontSize: '0.875rem' }}>
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row._id || i}
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--c-glass)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map((col) => (
                    <td key={col.header} style={{
                      padding: '0.85rem 1rem',
                      fontSize: '0.83rem',
                      borderBottom: '1px solid rgba(139,92,246,0.06)',
                      color: 'var(--c-text2)',
                      whiteSpace: 'nowrap',
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {col.cell ? col.cell(row) : col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.4rem',
          borderTop: '1px solid var(--c-border)',
          fontSize: '0.8rem', color: 'var(--c-text3)',
        }}>
          <span>Page {page} of {totalPages} · {sorted.length} rows</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Role badge ────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const map = {
    Admin: 'badge-red',
    EventOrganizer: 'badge-purple',
    Customer: 'badge-cyan',
  };
  return <span className={`badge ${map[role] || 'badge-gray'}`}>{role === 'EventOrganizer' ? 'Organizer' : role}</span>;
}

function StatusBadge({ status }) {
  const map = {
    open: 'badge-green', full: 'badge-amber', draft: 'badge-gray',
    completed: 'badge-gray', cancelled: 'badge-red', confirmed: 'badge-green',
    pending: 'badge-amber', succeeded: 'badge-green', failed: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

/* ── Main dashboard ────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeTable, setActiveTable] = useState('users');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteUser = async (id) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      // silent — could add a toast here
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    getAdminStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    getAllUsers()
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));

    getAllEvents()
      .then((r) => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  const usersChartData  = stats ? fillDays(stats.usersPerDay,   'count') : [];
  const revenueChartData = stats ? fillDays(stats.revenuePerDay, 'amount') : [];
  const bookingsChartData = stats ? fillDays(stats.bookingsPerDay, 'count') : [];

  /* Columns with rich cells for display (export uses accessor only) */
  const userTableCols = [
    {
      ...USER_COLS[0],
      cell: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {(`${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()) || u.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>{USER_COLS[0].accessor(u)}</span>
        </div>
      ),
    },
    USER_COLS[1],
    USER_COLS[2],
    { ...USER_COLS[3], cell: (u) => <RoleBadge role={u.role} /> },
    USER_COLS[4],
    USER_COLS[5],
    { ...USER_COLS[6], cell: (u) => <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} /> },
    USER_COLS[7],
    {
      header: 'Actions',
      accessor: () => '',
      cell: (u) => {
        if (confirmDeleteId === u._id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--c-text2)', whiteSpace: 'nowrap' }}>Sure?</span>
              <button
                onClick={() => handleDeleteUser(u._id)}
                disabled={deletingId === u._id}
                style={{
                  padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: 700,
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: 'var(--r)', cursor: 'pointer', opacity: deletingId === u._id ? 0.6 : 1,
                }}
              >
                {deletingId === u._id ? '…' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: 700,
                  background: 'var(--c-glass)', color: 'var(--c-text2)', border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r)', cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={() => setConfirmDeleteId(u._id)}
            title="Delete user"
            style={{
              background: 'none', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171',
              borderRadius: 'var(--r)', padding: '0.25rem 0.5rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.72rem', fontWeight: 600, transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        );
      },
    },
  ];

  const eventTableCols = [
    {
      ...EVENT_COLS[0],
      cell: (e) => <span style={{ color: 'var(--c-text)', fontWeight: 500, maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>,
    },
    { ...EVENT_COLS[1], cell: (e) => <span className="badge badge-purple">{e.category}</span> },
    EVENT_COLS[2],
    { ...EVENT_COLS[3], cell: (e) => <StatusBadge status={e.status} /> },
    EVENT_COLS[4],
    {
      header: 'Fill',
      accessor: (e) => `${e.registrations}/${e.capacity}`,
      cell: (e) => {
        const pct = Math.min(100, Math.round((e.registrations / e.capacity) * 100));
        const color = pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#10b981';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', minWidth: 42 }}>{e.registrations}/{e.capacity}</span>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden', minWidth: 50 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 9999 }} />
            </div>
          </div>
        );
      },
    },
    { ...EVENT_COLS[7], cell: (e) => <span style={{ color: e.price > 0 ? 'var(--c-amber)' : 'var(--c-success)', fontWeight: 600 }}>{EVENT_COLS[7].accessor(e)}</span> },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1280 }}>

        {/* ── Page header ── */}
        <div className="animate-fadeInDown" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--r)',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Admin Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--c-text2)', fontSize: '0.88rem' }}>
            Platform overview · last updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {loadingStats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--r-xl)' }} />
            ))
          ) : [
            { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() ?? '—', sub: `${stats?.totalCustomers ?? 0} customers · ${stats?.totalOrganizers ?? 0} organizers`, accent: 'var(--c-purple-400)' },
            { label: 'Total Events', value: stats?.totalEvents?.toLocaleString() ?? '—', sub: `${stats?.openEvents ?? 0} open · ${stats?.completedEvents ?? 0} ended`, accent: 'var(--c-cyan)' },
            { label: 'Total Bookings', value: stats?.totalBookings?.toLocaleString() ?? '—', sub: `${stats?.confirmedBookings ?? 0} confirmed`, accent: 'var(--c-emerald)' },
            { label: 'Total Revenue', value: stats ? fmt(stats.totalRevenue) : '—', sub: ' Confirmed Payments', accent: 'var(--c-gold)' },
            { label: 'Open Events', value: stats?.openEvents?.toLocaleString() ?? '—', sub: `${stats?.fullEvents ?? 0} sold out`, accent: 'var(--c-pink)' },
            { label: 'Organizers', value: stats?.totalOrganizers?.toLocaleString() ?? '—', sub: `${stats?.totalAdmins ?? 0} admin${stats?.totalAdmins !== 1 ? 's' : ''}`, accent: '#a78bfa' },
          ].map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.05} />)}
        </div>

        {/* ── Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <TrendChart
            data={usersChartData}
            color="var(--c-purple-500)"
            gradientId="usersGrad"
            title="Users Registered / Day"
            subtitle="Last 30 days"
          />
          <TrendChart
            data={revenueChartData}
            color="var(--c-pink)"
            gradientId="revenueGrad"
            isCurrency
            title="Revenue / Day (EGP)"
            subtitle="Last 30 days · Confirmed Payments"
          />
          <BookingsBarChart data={bookingsChartData} />
        </div>

        {/* ── Top events mini-table ── */}
        {stats?.topEvents?.length > 0 && (
          <div style={{
            padding: '1.4rem',
            background: 'var(--gradient-card)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-xl)',
            marginBottom: '2rem',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: 3, height: 16, background: 'var(--gradient-primary)', borderRadius: 2 }} />
              Top Events by Registrations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {stats.topEvents.map((ev, i) => {
                const pct = Math.min(100, Math.round((ev.registrations / ev.capacity) * 100));
                const barColor = pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#10b981';
                return (
                  <div key={ev._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--c-glass)',
                      border: '1px solid var(--c-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? '#fff' : 'var(--c-text3)',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 9999 }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--c-text3)', flexShrink: 0 }}>
                          {ev.registrations}/{ev.capacity} ({pct}%)
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Data Tables ── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['users', 'events'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTable(t)}
              className={activeTable === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ textTransform: 'capitalize' }}
            >
              {t === 'users' ? `Users (${users.length})` : `Events (${events.length})`}
            </button>
          ))}
        </div>

        {activeTable === 'users' && (
          <DataTable
            title="Registered Users"
            columns={userTableCols}
            rows={users}
            exportName="users"
            loading={loadingUsers}
          />
        )}
        {activeTable === 'events' && (
          <DataTable
            title="All Events"
            columns={eventTableCols}
            rows={events}
            exportName="events"
            loading={loadingEvents}
          />
        )}

      </div>
    </div>
  );
}
