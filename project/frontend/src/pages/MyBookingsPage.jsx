import React, { useState } from 'react';
import { bookingAPI } from '../utils/api';

const STATUS_FLOW = ['pending', 'confirmed', 'completed'];
const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatCreated = (iso) => new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

const BookingCard = ({ booking, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setUpdating(true);
    try { await bookingAPI.updateStatus(booking._id, 'cancelled'); onStatusUpdate(booking._id, 'cancelled'); }
    catch (err) { alert(err.userMessage || 'Failed to cancel'); }
    finally { setUpdating(false); }
  };

  const borderColors = { pending: 'var(--gold)', confirmed: 'var(--sage)', completed: 'var(--sky)', cancelled: 'var(--muted)' };

  return (
    <div style={{ display: 'flex', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: booking.status === 'cancelled' ? 0.75 : 1, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: 6, flexShrink: 0, background: borderColors[booking.status] || 'var(--border)' }} />
      <div style={{ flex: 1, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>{booking.expertName}</h3>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--muted)' }}>{booking.expertCategory}</span>
          </div>
          <span className={`badge badge-${booking.status}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
          {[[`📅`, formatDate(booking.date)], [`🕐`, `${booking.startTime} – ${booking.endTime}`], [`📋`, `Booked on ${formatCreated(booking.createdAt)}`]].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--ink-light)' }}>{icon} {text}</div>
          ))}
        </div>

        {booking.notes && <div style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 12, lineHeight: 1.5 }}><strong style={{ color: 'var(--ink-light)' }}>Notes:</strong> {booking.notes}</div>}

        {/* Progress bar */}
        {booking.status !== 'cancelled' && (
          <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 8px' }}>
            {STATUS_FLOW.map((s, i) => {
              const ci = STATUS_FLOW.indexOf(booking.status);
              const active = i <= ci;
              return (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: active ? 'var(--gold)' : 'var(--border)' }} />
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: active ? 'var(--ink-light)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: 2, background: i < ci ? 'var(--gold)' : 'var(--border)', margin: '-18px 4px 0' }} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {canCancel && (
          <button onClick={handleCancel} disabled={updating}
            style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', color: 'var(--rust)', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 2, cursor: 'pointer', transition: 'all var(--transition)' }}>
            {updating ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
};

const MyBookingsPage = () => {
  const [emailInput, setEmailInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) { setError('Please enter a valid email address'); return; }
    setLoading(true); setError(null); setSearched(false);
    try {
      const res = await bookingAPI.getByEmail(trimmed);
      setBookings(res.data.data);
      setSearchedEmail(trimmed);
      setSearched(true);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id, status) => setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

  const today = new Date().toISOString().split('T')[0];
  const groups = {
    upcoming: bookings.filter(b => ['pending', 'confirmed'].includes(b.status) && b.date >= today),
    past: bookings.filter(b => b.status === 'completed' || (b.status !== 'cancelled' && b.date < today)),
    cancelled: bookings.filter(b => b.status === 'cancelled'),
  };

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--ink)', padding: '56px 0 40px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>◈ Session History</div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--cream)', marginBottom: 12 }}>My Bookings</h1>
          <p style={{ color: 'rgba(248,245,240,0.6)', fontSize: 16 }}>Track and manage all your expert sessions</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 40 }}>
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>Find Your Bookings</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Enter the email address you used when booking</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <input type="email" className={`form-input ${error ? 'error' : ''}`} style={{ flex: 1 }} placeholder="your@email.com" value={emailInput} onChange={e => { setEmailInput(e.target.value); setError(null); }} />
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Find Bookings'}</button>
          </form>
          {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
        </div>

        {searched && (
          <>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 48, color: 'var(--border)' }}>◎</div>
                <h3 style={{ fontSize: 22 }}>No bookings found</h3>
                <p style={{ color: 'var(--muted)' }}>No bookings found for <strong>{searchedEmail}</strong></p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, padding: '12px 16px', background: 'var(--cream-dark)', borderRadius: 'var(--radius)' }}>
                  Found <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? 's' : ''} for <strong>{searchedEmail}</strong>
                </div>
                {[['Upcoming Sessions', groups.upcoming, '#C9A84C'], ['Past Sessions', groups.past, '#3A6B8A'], ['Cancelled', groups.cancelled, '#8A8070']].map(([title, list, dotColor]) =>
                  list.length > 0 && (
                    <div key={title} style={{ marginBottom: 36 }}>
                      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />{title} ({list.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {list.map(b => <BookingCard key={b._id} booking={b} onStatusUpdate={handleStatusUpdate} />)}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
