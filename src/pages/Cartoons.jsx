import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import './Cartoons.css';

export default function Cartoons() {
  const [cartoons, setCartoons] = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode,  setSearchMode]  = useState('cartoons');
  const [userResults,   setUserResults]   = useState([]);
  const [userSearching, setUserSearching] = useState(false);

  // ── Cartoon filters ──
  const [genreFilter,  setGenreFilter]  = useState('');
  const [yearFilter,   setYearFilter]   = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchAll() {
      const [cartoonsRes, reviewsRes] = await Promise.all([
        supabase.from('cartoons').select('*').order('title', { ascending: true }),
        supabase.from('reviews').select('show_title, rating, status'),
      ]);
      if (cartoonsRes.error) setError(cartoonsRes.error.message);
      else setCartoons(cartoonsRes.data ?? []);
      setReviews(reviewsRes.data ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // Debounced user search
  useEffect(() => {
    if (searchMode !== 'users' || !searchQuery.trim()) {
      setUserResults([]);
      setUserSearching(false);
      return;
    }
    setUserSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery.trim()}%`)
        .limit(20);
      setUserResults(data ?? []);
      setUserSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  // Per-cartoon avg rating + set of community statuses
  const reviewStats = useMemo(() => {
    const stats = {};
    for (const r of reviews) {
      if (!stats[r.show_title]) stats[r.show_title] = { ratings: [], statuses: new Set() };
      stats[r.show_title].ratings.push(r.rating);
      stats[r.show_title].statuses.add(r.status);
    }
    return stats;
  }, [reviews]);

  const genres = useMemo(() =>
    [...new Set(cartoons.map(c => c.genre).filter(Boolean))].sort()
  , [cartoons]);

  const years = useMemo(() =>
    [...new Set(cartoons.map(c => c.release_year).filter(Boolean))].sort((a, b) => b - a)
  , [cartoons]);

  // Cartoons filtered by dropdowns + search query together
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cartoons.filter(c => {
      if (q && !c.title.toLowerCase().includes(q)) return false;
      if (genreFilter && c.genre !== genreFilter) return false;
      if (yearFilter  && String(c.release_year) !== yearFilter) return false;

      const stats = reviewStats[c.title];
      if (ratingFilter) {
        if (!stats || stats.ratings.length === 0) return false;
        const avg = stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length;
        if (avg < Number(ratingFilter)) return false;
      }
      if (statusFilter) {
        if (!stats || !stats.statuses.has(statusFilter)) return false;
      }
      return true;
    });
  }, [cartoons, searchQuery, genreFilter, yearFilter, ratingFilter, statusFilter, reviewStats]);

  const hasFilters = genreFilter || yearFilter || ratingFilter || statusFilter;
  const hasSearch  = searchQuery.trim().length > 0;

  function resetFilters() {
    setGenreFilter('');
    setYearFilter('');
    setRatingFilter('');
    setStatusFilter('');
  }

  function clearSearch() {
    setSearchQuery('');
    setUserResults([]);
  }

  // Switch mode: clear stale results
  function handleModeChange(mode) {
    setSearchMode(mode);
    setUserResults([]);
  }

  const showingUsers    = searchMode === 'users' && hasSearch;
  const showingCartoons = searchMode === 'cartoons' || !hasSearch;

  return (
    <div className="tt-page">
      <div className="tt-page-inner">
        <h1 className="tt-page-title">Browse Cartoons</h1>
        <p className="tt-page-sub">Discover and track animated shows.</p>

        {/* ── Search bar ── */}
        <div className="tt-search-bar">
          <select
            className="tt-search-mode-select"
            value={searchMode}
            onChange={e => handleModeChange(e.target.value)}
            aria-label="Search type"
          >
            <option value="cartoons">Cartoons</option>
            <option value="users">Users</option>
          </select>
          <div className="tt-search-input-wrap">
            <span className="tt-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="tt-search-input"
              placeholder={searchMode === 'users' ? 'Search users…' : 'Search cartoons…'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label={searchMode === 'users' ? 'Search users' : 'Search cartoons'}
            />
            {hasSearch && (
              <button type="button" className="tt-search-clear" onClick={clearSearch} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        {/* ── User search results ── */}
        {showingUsers && (
          <div className="tt-user-results">
            {userSearching && <p className="tt-list-status">Searching…</p>}

            {!userSearching && userResults.length === 0 && (
              <div className="tt-placeholder-notice">No users found for "{searchQuery}".</div>
            )}

            {!userSearching && userResults.length > 0 && (
              <>
                <p className="tt-filter-summary">{userResults.length} user{userResults.length !== 1 ? 's' : ''} found</p>
                <div className="tt-user-result-list">
                  {userResults.map(u => (
                    <Link key={u.id} to={`/profile/${u.id}`} className="tt-user-result-row">
                      <Avatar src={u.avatar_url} username={u.username} size={40} />
                      <span className="tt-user-result-name">{u.username ?? 'Anonymous'}</span>
                      <span className="tt-user-result-arrow" aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Cartoon filters + grid (hidden during user search) ── */}
        {showingCartoons && (
          <>
            {!loading && !error && cartoons.length > 0 && (
              <div className="tt-cartoon-filters">
                <select className="tt-filter-select" value={genreFilter} onChange={e => setGenreFilter(e.target.value)} aria-label="Filter by genre">
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="tt-filter-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)} aria-label="Filter by release year">
                  <option value="">All Years</option>
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select className="tt-filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} aria-label="Filter by minimum average rating">
                  <option value="">Any Rating</option>
                  <option value="5">★★★★★  5 stars</option>
                  <option value="4">★★★★  4+ stars</option>
                  <option value="3">★★★  3+ stars</option>
                  <option value="2">★★  2+ stars</option>
                  <option value="1">★  1+ star</option>
                </select>
                <select className="tt-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by watch status">
                  <option value="">All Statuses</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
                {hasFilters && (
                  <button type="button" className="tt-btn tt-btn-ghost tt-btn-sm" onClick={resetFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && (hasFilters || hasSearch) && (
              <p className="tt-filter-summary">{filtered.length} of {cartoons.length} cartoons</p>
            )}

            {loading && <p className="tt-list-status">Loading cartoons…</p>}
            {error   && <p className="tt-auth-error" role="alert">{error}</p>}

            {!loading && !error && filtered.length === 0 && (
              <div className="tt-placeholder-notice">
                {hasFilters || hasSearch
                  ? <><span>No cartoons match. </span><button type="button" className="tt-btn-inline" onClick={() => { resetFilters(); clearSearch(); }}>Clear all</button></>
                  : 'No cartoons found.'
                }
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="tt-cartoon-grid">
                {filtered.map(c => {
                  const stats = reviewStats[c.title];
                  const avgRating = stats?.ratings.length > 0
                    ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1)
                    : null;
                  return (
                    <Link key={c.id} to={`/cartoons/${c.id}`} className="tt-cartoon-card">
                      <div className="tt-cartoon-cover">
                        {c.cover_image_url
                          ? <img src={c.cover_image_url} alt={c.title} />
                          : <span className="tt-cartoon-cover-placeholder" aria-hidden="true">🎬</span>
                        }
                      </div>
                      <div className="tt-cartoon-info">
                        <h3 className="tt-cartoon-title">{c.title}</h3>
                        <div className="tt-cartoon-meta">
                          {c.genre        && <span className="tt-cartoon-genre">{c.genre}</span>}
                          {c.release_year && <span className="tt-cartoon-year">{c.release_year}</span>}
                          {avgRating      && <span className="tt-cartoon-avg-rating">★ {avgRating}</span>}
                        </div>
                        {c.description && (
                          <p className="tt-cartoon-desc">
                            {c.description.length > 100
                              ? c.description.slice(0, 100) + '…'
                              : c.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


