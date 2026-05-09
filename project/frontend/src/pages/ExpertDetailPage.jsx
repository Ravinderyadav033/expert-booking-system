import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expertAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import BookingModal from '../components/BookingModal';

const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

const ExpertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [expert, setExpert] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState(null);

  const fetchExpert = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await expertAPI.getById(id);
      setExpert(res.data.data);
      setSlotsByDate(res.data.data.slotsByDate);
      const dates = Object.keys(res.data.data.slotsByDate);
      if (dates.length > 0) setSelectedDate(dates[0]);
    } catch (err) {
      setError(err.userMessage || 'Expert not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchExpert(); }, [fetchExpert]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join-expert', id);

    const handleBooked = ({ date, startTime, endTime }) => {
      setSlotsByDate(prev => {
        const updated = { ...prev };
        if (updated[date]) updated[date] = updated[date].map(s => s.startTime === startTime && s.endTime === endTime ? { ...s, isBooked: true } : s);
        return updated;
      });
      setRealtimeUpdate(`Slot at ${startTime} on ${formatDate(date)} was just booked!`);
      setTimeout(() => setRealtimeUpdate(null), 4000);
    };

    const handleFreed = ({ date, startTime, endTime }) => {
      setSlotsByDate(prev => {
        const updated = { ...prev };
        if (updated[date]) updated[date] = updated[date].map(s => s.startTime === startTime && s.endTime === endTime ? { ...s, isBooked: false } : s);
        return updated;
      });
    };

    socket.on('slot-booked', handleBooked);
    socket.on('slot-freed', handleFreed);
    return () => { socket.emit('leave-expert', id); socket.off('slot-booked', handleBooked); socket.off('slot-freed', handleFreed); };
  }, [socket, id]);

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    setSlotsByDate(prev => {
      const updated = { ...prev };
      if (updated[booking.date]) updated[booking.date] = updated[booking.date].map(s => s.startTime === booking.startTime ? { ...s, isBooked: true } : s);
      return updated;
    });
    setSelectedSlot(null);
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, color: 'var(--muted)' }}><div className="spinner" /><p>Loading expert profile...</p></div>;
  if (error) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}><div style={{ fontSize: 48, color: 'var(--rust)' }}>⚠</div><h3>{error}</h3><button className="btn btn-primary" onClick={() => navigate('/')}>Back to Experts</button></div>;

  const dates = Object.keys(slotsByDate).sort();
  const selectedSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  return (
    <div className="page-enter">
      {/* Realtime toast */}
      {realtimeUpdate && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 200, background: 'var(--ink)', color: 'var(--cream)', padding: '12px 20px', borderRadius: 'var(--radius)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-lg)', maxWidth: 320 }}>
          <span style={{ width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', flexShrink: 0, animation: 'blink 1s infinite' }} />
          {realtimeUpdate}
        </div>
      )}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Hero */}
      <div style={{ background: 'var(--ink)', padding: '40px 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'rgba(248,245,240,0.5)', fontSize: 14, marginBottom: 24, padding: 0, cursor: 'pointer', transition: 'color var(--transition)' }}>← Back</button>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 96, height: 96, background: 'var(--gold)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
              {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{expert.category}</div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--cream)', marginBottom: 12 }}>{expert.name}</h1>
              <p style={{ fontSize: 15, color: 'rgba(248,245,240,0.65)', lineHeight: 1.6, marginBottom: 24, maxWidth: 600 }}>{expert.bio}</p>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
                {[['Experience', `${expert.experience} years`], ['Rating', `★ ${expert.rating?.toFixed(1)}`], ['Rate', `₹${expert.hourlyRate?.toLocaleString()}/hr`], ['Sessions', expert.totalBookings || 0]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--cream)', fontWeight: 500 }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(248,245,240,0.45)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {expert.skills?.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="container" style={{ padding: '48px 24px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28 }}>Available Time Slots</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--sage)', background: 'rgba(92,122,92,0.1)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(92,122,92,0.3)' }}>
            <span style={{ width: 8, height: 8, background: 'var(--sage)', borderRadius: '50%', animation: 'blink 1.5s infinite' }} /> Live Updates
          </div>
        </div>

        {dates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>No available slots at the moment.</div>
        ) : (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Date tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
              {dates.map(date => {
                const avail = slotsByDate[date].filter(s => !s.isBooked).length;
                const active = selectedDate === date;
                return (
                  <button key={date} onClick={() => setSelectedDate(date)}
                    style={{ textAlign: 'left', padding: '14px 18px', background: active ? 'var(--ink)' : 'var(--white)', border: `1.5px solid ${active ? 'var(--ink)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all var(--transition)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--cream)' : 'var(--ink)' }}>{formatDate(date)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'rgba(248,245,240,0.6)' : avail === 0 ? 'var(--rust)' : 'var(--sage)' }}>{avail} slot{avail !== 1 ? 's' : ''} left</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
              {selectedSlots.map(slot => {
                const selected = selectedSlot?._id === slot._id && selectedDate === slot.date;
                return (
                  <button key={slot._id || `${slot.date}-${slot.startTime}`}
                    onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                    disabled={slot.isBooked}
                    style={{ padding: 16, background: slot.isBooked ? 'var(--cream-dark)' : selected ? 'var(--gold-pale)' : 'var(--white)', border: `2px solid ${slot.isBooked ? 'var(--border)' : selected ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: slot.isBooked ? 'not-allowed' : 'pointer', transition: 'all var(--transition)', textAlign: 'left', opacity: slot.isBooked ? 0.6 : 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: slot.isBooked ? 'var(--muted)' : 'var(--ink)', marginBottom: 6 }}>{slot.startTime} – {slot.endTime}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: slot.isBooked ? 'var(--rust)' : selected ? 'var(--gold)' : 'var(--sage)' }}>{slot.isBooked ? 'Booked' : 'Available'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        {selectedSlot && selectedDate && (
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)', border: '2px solid var(--gold)', borderRadius: 'var(--radius-lg)', padding: '20px 28px', gap: 20, boxShadow: '0 8px 24px rgba(201,168,76,0.15)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Selected:</span>
              <strong>{formatDate(selectedDate)}, {selectedSlot.startTime} – {selectedSlot.endTime}</strong>
            </div>
            <button className="btn btn-gold" onClick={() => setShowBooking(true)}>Book This Slot →</button>
          </div>
        )}
      </div>

      {showBooking && selectedSlot && (
        <BookingModal expert={expert} date={selectedDate} slot={selectedSlot} onClose={() => setShowBooking(false)} onSuccess={handleBookingSuccess} />
      )}
    </div>
  );
};

export default ExpertDetailPage;
