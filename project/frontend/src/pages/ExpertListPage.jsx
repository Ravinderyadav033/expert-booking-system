import React, { useState, useEffect, useCallback } from 'react';
import ExpertCard from '../components/ExpertCard';
import { expertAPI } from '../utils/api';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Business', 'Education'];

const ExpertListPage = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchExperts = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 6 };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await expertAPI.getAll(params);
      setExperts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.userMessage || 'Failed to load experts.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchExperts(1); }, [fetchExperts]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const clearSearch = () => { setSearch(''); setSearchInput(''); };
  const handleCategory = (cat) => { setCategory(cat); setSearch(''); setSearchInput(''); };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{ background: 'var(--ink)', padding: '72px 0 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>◈ Expert Sessions</div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--cream)', marginBottom: 16, lineHeight: 1.1 }}>Find Your Expert,<br />Unlock Your Potential</h1>
          <p style={{ fontSize: 17, color: 'rgba(248,245,240,0.6)', marginBottom: 36, maxWidth: 500 }}>Book 1:1 sessions with India's top professionals in tech, finance, health & more.</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 640 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'rgba(248,245,240,0.4)' }}>⌕</span>
              <input type="text" placeholder="Search by name, skill or expertise..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius)', color: 'var(--cream)', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
            {search && <button type="button" className="btn btn-outline" onClick={clearSearch} style={{ color: 'var(--cream)', borderColor: 'rgba(255,255,255,0.3)' }}>Clear</button>}
          </form>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              style={{ padding: '8px 18px', borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all var(--transition)', whiteSpace: 'nowrap', background: category === cat ? 'var(--ink)' : 'var(--white)', color: category === cat ? 'var(--cream)' : 'var(--ink-light)', border: `1.5px solid ${category === cat ? 'var(--ink)' : 'var(--border)'}` }}>
              {cat}
            </button>
          ))}
        </div>

        {!loading && !error && <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}><strong>{pagination.total}</strong> expert{pagination.total !== 1 ? 's' : ''} found{category !== 'All' ? ` in ${category}` : ''}</p>}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animation: 'pulse 1.5s ease infinite' }}>
                <div style={{ height: 4, background: 'var(--cream-dark)' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, background: 'var(--cream-dark)', borderRadius: 'var(--radius)' }} />
                    <div style={{ width: 80, height: 24, background: 'var(--cream-dark)', borderRadius: 2 }} />
                  </div>
                  <div style={{ height: 20, background: 'var(--cream-dark)', borderRadius: 2, marginBottom: 10, width: '80%' }} />
                  <div style={{ height: 14, background: 'var(--cream-dark)', borderRadius: 2, marginBottom: 10 }} />
                  <div style={{ height: 14, background: 'var(--cream-dark)', borderRadius: 2, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, color: 'var(--rust)' }}>⚠</div>
            <h3 style={{ fontSize: 22, margin: '12px 0 8px' }}>Something went wrong</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{error}</p>
            <button className="btn btn-primary" onClick={() => fetchExperts(1)}>Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && experts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, color: 'var(--border)' }}>◎</div>
            <h3 style={{ fontSize: 22, margin: '12px 0 8px' }}>No experts found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Try adjusting your search or filter criteria</p>
            <button className="btn btn-outline" onClick={() => { clearSearch(); setCategory('All'); }}>Clear Filters</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && experts.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {experts.map(e => <ExpertCard key={e._id} expert={e} />)}
            </div>

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 48 }}>
                <button className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 13 }} disabled={pagination.page <= 1} onClick={() => { fetchExperts(pagination.page - 1); window.scrollTo({ top: 0 }); }}>← Prev</button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => { fetchExperts(i + 1); window.scrollTo({ top: 0 }); }}
                    style={{ width: 36, height: 36, borderRadius: 2, border: '1.5px solid var(--border)', background: pagination.page === i + 1 ? 'var(--ink)' : 'var(--white)', color: pagination.page === i + 1 ? 'var(--cream)' : 'var(--ink-light)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    {i + 1}
                  </button>
                ))}
                <button className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 13 }} disabled={pagination.page >= pagination.pages} onClick={() => { fetchExperts(pagination.page + 1); window.scrollTo({ top: 0 }); }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpertListPage;
