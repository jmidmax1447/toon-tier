import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ReviewCard from '../components/ReviewCard';
import ReviewFilters from '../components/ReviewFilters';

export default function CartoonDetail() {
  const { id }   = useParams();
  const { user } = useAuth();

  const [cartoon,      setCartoon]      = useState(null);
  const [cartoonError, setCartoonError] = useState(null);
  const [reviews,      setReviews]      = useState([]);
  const [reviewers,    setReviewers]    = useState({});
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    async function fetchAll() {
      // Fetch cartoon info and its reviews in parallel
      const [cartoonRes, reviewsRes] = await Promise.all([
        supabase.from('cartoons').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      ]);

      if (cartoonRes.error || !cartoonRes.data) {
        setCartoonError('Cartoon not found.');
        setLoading(false);
        return;
      }

      setCartoon(cartoonRes.data);
      const matched = (reviewsRes.data ?? []).filter(
        r => r.show_title === cartoonRes.data.title
      );
      setReviews(matched);

      // Batch-fetch profiles for all reviewers
      const userIds = [...new Set(matched.map(r => r.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        const map = {};
        for (const p of profilesData ?? []) map[p.id] = p;
        setReviewers(map);
      }

      setLoading(false);
    }

    fetchAll();
  }, [id]);

  const filteredReviews = reviews
    .filter(r => !statusFilter || r.status === statusFilter)
    .filter(r => !ratingFilter || r.rating >= ratingFilter);

  function resetFilters() {
    setStatusFilter('');
    setRatingFilter(0);
  }

  if (loading) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-list-status">Loading…</p>
    </div></div>
  );

  if (cartoonError) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-auth-error" role="alert" style={{ marginTop: '1rem' }}>{cartoonError}</p>
    </div></div>
  );

  return (
    <div className="tt-page">
      <div className="tt-page-inner">

        {/* ── Cartoon header ── */}
        <div className="tt-cartoon-detail-hero">
          <div className="tt-cartoon-cover tt-cartoon-cover--hero">
            {cartoon.cover_image_url
              ? <img src={cartoon.cover_image_url} alt={`${cartoon.title} cover`} />
              : <span className="tt-cartoon-cover-placeholder" aria-hidden="true">🎬</span>
            }
          </div>
          <div className="tt-cartoon-detail-meta">
            <h1 className="tt-page-title" style={{ marginBottom: '0.5rem' }}>{cartoon.title}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {cartoon.genre        && <span className="tt-cartoon-genre">{cartoon.genre}</span>}
              {cartoon.release_year && <span className="tt-cartoon-year">{cartoon.release_year}</span>}
            </div>
            {cartoon.description && (
              <p className="tt-page-sub" style={{ maxWidth: '640px', marginBottom: '1.5rem' }}>
                {cartoon.description}
              </p>
            )}
          </div>
        </div>

        {user && (
          <Link
            to={`/cartoons/${id}/review/new`}
            state={{ showTitle: cartoon.title }}
            className="tt-btn tt-btn-primary"
            style={{ marginBottom: '2.5rem', display: 'inline-block' }}
          >
            + Write a Review
          </Link>
        )}

        {/* ── Reviews ── */}
        <div className="tt-section-header">
          <h2 className="tt-section-title">
            {`${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`}
          </h2>
        </div>

        {reviews.length === 0 && (
          <div className="tt-placeholder-notice">
            No reviews yet.{' '}
            {user
              ? <Link to={`/cartoons/${id}/review/new`} state={{ showTitle: cartoon.title }} className="tt-link">Be the first →</Link>
              : <Link to="/login" className="tt-link">Sign in to leave one →</Link>
            }
          </div>
        )}

        {reviews.length > 0 && (
          <>
            <ReviewFilters
              statusFilter={statusFilter}
              ratingFilter={ratingFilter}
              onStatusChange={setStatusFilter}
              onRatingChange={setRatingFilter}
              total={reviews.length}
              filtered={filteredReviews.length}
              onReset={resetFilters}
            />

            {filteredReviews.length === 0 ? (
              <div className="tt-placeholder-notice">
                No reviews match your filters.{' '}
                <button type="button" className="tt-btn-inline" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="tt-review-list">
                {filteredReviews.map(r => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    reviewer={reviewers[r.user_id]}
                    showEditLink={user?.id === r.user_id}
                    onDelete={deletedId => setReviews(prev => prev.filter(r => r.id !== deletedId))}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}


