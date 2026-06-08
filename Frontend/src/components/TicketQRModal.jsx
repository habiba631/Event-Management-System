import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CATEGORY_GRADIENTS = {
  Music:      'linear-gradient(135deg,#7c3aed,#ec4899)',
  Sports:     'linear-gradient(135deg,#0ea5e9,#10b981)',
  Technology: 'linear-gradient(135deg,#6366f1,#06b6d4)',
  Arts:       'linear-gradient(135deg,#f59e0b,#ef4444)',
  Food:       'linear-gradient(135deg,#f97316,#fbbf24)',
  Business:   'linear-gradient(135deg,#3b82f6,#6d28d9)',
  Health:     'linear-gradient(135deg,#10b981,#06b6d4)',
  Education:  'linear-gradient(135deg,#8b5cf6,#3b82f6)',
  Default:    'linear-gradient(135deg,#7c3aed,#ec4899)',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function MetaRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
      <span style={{ color: 'var(--c-purple-400)', flexShrink: 0, marginTop: '0.05rem' }}>{icon}</span>
      <span style={{ fontSize: '0.83rem', color: 'var(--c-text2)', lineHeight: 1.45 }}>{value}</span>
    </div>
  );
}

export default function TicketQRModal({ booking, holderName, onClose }) {
  const ticketRef = useRef(null);
  const event = booking.event;
  const gradient = CATEGORY_GRADIENTS[event?.category] || CATEGORY_GRADIENTS.Default;

  // Data encoded in the QR code — enough for a scanner to verify the booking
  const qrData = JSON.stringify({
    bookingId: booking._id,
    eventId: event?._id,
    tickets: booking.ticketCount,
    holder: holderName,
    status: booking.status,
  });

  const handleDownload = () => {
    const svgEl = ticketRef.current?.querySelector('svg[data-qr]');
    if (!svgEl) return;

    // Serialize SVG → canvas → PNG download
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `ticket-${booking._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  const handlePrint = () => window.print();

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content"
        style={{ maxWidth: 480, background: 'var(--c-bg3)', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--c-purple-400)" strokeWidth="2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
              <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
            </svg>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Your Ticket</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Ticket body */}
        <div style={{ padding: '1.4rem' }} ref={ticketRef}>
          <div style={{
            background: 'var(--c-bg2)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
          }}>
            {/* Top gradient banner */}
            <div style={{
              height: 90,
              background: gradient,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0.75rem 1.25rem',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 100%)',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>
                  {event?.category || 'Event'}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2, maxWidth: 300 }}>
                  {event?.title || 'Event Ticket'}
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              margin: '0 -1px',
            }}>
              {/* Left notch */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--c-bg3)',
                border: '1px solid var(--c-border)',
                flexShrink: 0,
                marginLeft: -10,
              }} />
              {/* Dashed line */}
              <div style={{
                flex: 1,
                borderTop: '2px dashed rgba(139,92,246,0.25)',
                margin: '0 0.5rem',
              }} />
              {/* Right notch */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--c-bg3)',
                border: '1px solid var(--c-border)',
                flexShrink: 0,
                marginRight: -10,
              }} />
            </div>

            {/* QR + Details */}
            <div style={{
              display: 'flex',
              gap: '1.25rem',
              padding: '1.25rem',
              alignItems: 'flex-start',
            }}>
              {/* QR code */}
              <div style={{
                flexShrink: 0,
                padding: 10,
                background: '#fff',
                borderRadius: 'var(--r)',
                lineHeight: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <QRCodeSVG
                  data-qr="true"
                  value={qrData}
                  size={108}
                  bgColor="#ffffff"
                  fgColor="#0d0d24"
                  level="M"
                />
              </div>

              {/* Event details */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <MetaRow
                  icon={
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8"  y1="2" x2="8"  y2="6" />
                      <line x1="3"  y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  value={`${formatDate(event?.startsAt)}${event?.startsAt ? ` · ${formatTime(event.startsAt)}` : ''}`}
                />
                {event?.location && (
                  <MetaRow
                    icon={
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    }
                    value={[event.location, event.city, event.country].filter(Boolean).join(', ')}
                  />
                )}
                <MetaRow
                  icon={
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
                    </svg>
                  }
                  value={`${booking.ticketCount} ticket${booking.ticketCount !== 1 ? 's' : ''}`}
                />
                {holderName && (
                  <MetaRow
                    icon={
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    }
                    value={holderName}
                  />
                )}
              </div>
            </div>

            {/* Bottom stub */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'rgba(139,92,246,0.06)',
              borderTop: '1px dashed rgba(139,92,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--c-text3)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                #{booking._id.slice(-10).toUpperCase()}
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                ✓ Confirmed
              </span>
            </div>
          </div>

          <p style={{
            textAlign: 'center', marginTop: '0.85rem',
            fontSize: '0.75rem', color: 'var(--c-text3)', lineHeight: 1.5,
          }}>
            Show this QR code at the event entrance for check-in.
          </p>
        </div>

        {/* Footer actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download QR
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
