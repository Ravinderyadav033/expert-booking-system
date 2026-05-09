import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CAT_COLORS = { Technology: '#3A6B8A', Finance: '#5C7A5C', Health: '#8A3A6B', Legal: '#6B5C3A', Marketing: '#C4622D', Design: '#6B3A8A', Business: '#3A5C8A', Education: '#5C8A3A' };

const ExpertCard = ({ expert }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const color = CAT_COLORS[expert.category] || '#5C5C5C';

  return (
    <div
      onClick={() => navigate(`/expert/${expert._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', border: hovered ? '1.5px solid var(--gold)' : '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all var(--transition)', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius)', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'white' }}>
          {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2, color, border: `1px solid ${color}30`, background: `${color}12` }}>{expert.category}</span>
      </div>
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{expert.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>{expert.bio.slice(0, 100)}...</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--cream-dark)', borderBottom: '1px solid var(--cream-dark)', marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{expert.experience}</div><div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>yrs</div></div>
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 14, color: 'var(--gold)' }}>{'★'.repeat(Math.floor(expert.rating))}</div><div style={{ fontSize: 12, fontWeight: 600 }}>{expert.rating.toFixed(1)}</div></div>
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>₹{expert.hourlyRate.toLocaleString()}</div><div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>/hr</div></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {expert.skills?.slice(0, 3).map(s => <span key={s} className="skill-chip">{s}</span>)}
          {expert.skills?.length > 3 && <span className="skill-chip">+{expert.skills.length - 3}</span>}
        </div>
      </div>
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--cream-dark)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', letterSpacing: hovered ? 0.8 : 0.3, transition: 'letter-spacing var(--transition)' }}>Book a Session →</span>
      </div>
    </div>
  );
};

export default ExpertCard;
