import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../utils/api';

const validate = (f) => {
  const e = {};
  if (!f.clientName.trim() || f.clientName.trim().length < 2) e.clientName = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(f.clientEmail)) e.clientEmail = 'Please enter a valid email';
  if (!/^[\d\s\+\-\(\)]{7,15}$/.test(f.clientPhone)) e.clientPhone = 'Please enter a valid phone number';
  if (f.notes && f.notes.length > 500) e.notes = 'Notes must be under 500 characters';
  return e;
};

const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const BookingModal = ({ expert, date, slot, onClose, onSuccess }) => {
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate(form);
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setSubmitting(true); setApiError(null);
    try {
      const res = await bookingAPI.create({ expertId: expert._id, clientName: form.clientName.trim(), clientEmail: form.clientEmail.trim(), clientPhone: form.clientPhone.trim(), date, startTime: slot.startTime, endTime: slot.endTime, notes: form.notes.trim() });
      setSuccess(res.data.data);
      onSuccess(res.data.data);
    } catch (err) {
      setApiError(err.userMessage || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(26,22,17,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const modal = { background: 'var(--white)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-lg)' };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream-dark)', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: 12, color: 'var(--muted)', cursor: 'pointer', zIndex: 1 }}>✕</button>

        {success ? (
          <div style={{ padding: '48px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, background: 'var(--sage)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
            <h2>Booking Confirmed!</h2>
            <p style={{ color: 'var(--muted)' }}>Your session has been successfully booked.</p>
            <div style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {[['Expert', expert.name], ['Date', formatDate(date)], ['Time', `${slot.startTime} – ${slot.endTime}`], ['Status', 'Pending']].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  {label === 'Status' ? <span className="badge badge-pending">{val}</span> : <strong>{val}</strong>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Check <strong>My Bookings</strong> to track your session status.</p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--ink)', padding: '32px 32px 24px', borderRadius: '8px 8px 0 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Book a Session</div>
              <h2 style={{ color: 'var(--cream)', fontSize: 28, marginBottom: 16 }}>{expert.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {[`📅 ${formatDate(date)}`, `🕐 ${slot.startTime} – ${slot.endTime}`, `💰 ₹${expert.hourlyRate?.toLocaleString()}`].map(item => (
                  <span key={item} style={{ fontSize: 13, color: 'rgba(248,245,240,0.65)' }}>{item}</span>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>
              {apiError && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: 13, marginBottom: 20 }}>⚠ {apiError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { name: 'clientName', label: 'Full Name *', type: 'text', placeholder: 'Your full name', col: 1 },
                  { name: 'clientEmail', label: 'Email *', type: 'email', placeholder: 'you@example.com', col: 1 },
                  { name: 'clientPhone', label: 'Phone *', type: 'tel', placeholder: '+91 98765 43210', col: 1 },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name} className="form-group">
                    <label className="form-label">{label}</label>
                    <input type={type} name={name} value={form[name]} onChange={handleChange} className={`form-input ${errors[name] ? 'error' : ''}`} placeholder={placeholder} />
                    {errors[name] && <span className="form-error">{errors[name]}</span>}
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className={`form-input ${errors.notes ? 'error' : ''}`} placeholder="Topics, questions, goals..." rows={4} style={{ resize: 'vertical' }} />
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>{form.notes.length}/500</div>
                  {errors.notes && <span className="form-error">{errors.notes}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={submitting}>{submitting ? 'Booking...' : 'Confirm Booking'}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
