import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  const navStyle = {
    position: 'sticky', top: 0, zIndex: 100,
    background: scrolled ? 'rgba(248,245,240,0.96)' : 'var(--cream)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    backdropFilter: scrolled ? 'blur(8px)' : 'none',
    boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
    padding: scrolled ? '12px 0' : '16px 0',
    transition: 'all var(--transition)',
  };

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--ink)', transition: 'color var(--transition)' }}>
          <span style={{ color: 'var(--gold)' }}>◈</span> ExpertConnect
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {['/', '/my-bookings'].map((path) => (
            <Link key={path} to={path} style={{
              padding: '8px 20px', fontSize: 14, fontWeight: isActive(path) ? 600 : 500,
              color: isActive(path) ? 'var(--ink)' : 'var(--ink-light)',
              borderRadius: 2, textDecoration: 'none',
              borderBottom: isActive(path) ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all var(--transition)',
            }}>
              {path === '/' ? 'Experts' : 'My Bookings'}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
