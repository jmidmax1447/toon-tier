import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import ReviewCard from '../components/ReviewCard';
import StatsPanel from '../components/StatsPanel';

export default function PublicProfile() {
  const { userId } = useParams();

  const [profile,       setProfile]       = useState(null);
  const [reviews,       setReviews]       = useState([]);
  const [cartoonGenres, setCartoonGenres] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);

  useEffect(() => {
    async function fetchAll() {
      const [profileRes, reviewsRes, cartoonsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('cartoons').select('title, genre'),
      ]);

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileRes.data);
      setReviews(reviewsRes.data ?? []);

      // Build show_title → genre lookup for StatsPanel
      const genreMap = {};
      for (const c of cartoonsRes.data ?? []) {
        if (c.genre) genreMap[c.title] = c.genre;
      }
      setCartoonGenres(genreMap);

      setLoading(false);
    }

    fetchAll();
  }, [userId]);

  if (loading) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-list-status">Loading profile…</p>
    </div></div>
  );

  if (notFound) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-auth-error" role="alert" style={{ marginTop: '1rem' }}>
        User not found.
      </p>
    </div></div>
  );

  const displayName = profile.username ?? 'Anonymous';

  return (
    <div className="tt-page">
      <div className="tt-page-inner">

        {/* ── Profile header ── */}
        <div className="tt-profile-header">
          <Avatar src={profile.avatar_url} username={displayName} size={72} />
          <div className="tt-profile-header-info">
            <h1 className="tt-page-title" style={{ marginBottom: '0.1rem' }}>{displayName}</h1>
            <p className="tt-page-sub" style={{ marginBottom: 0 }}>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* ── Stats dashboard ── */}
        <StatsPanel
          reviews={reviews}
          cartoonGenres={cartoonGenres}
          title="Stats"
        />

        {/* ── Reviews ── */}
        <div className="tt-section-header">
          <h2 className="tt-section-title">Reviews</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="tt-placeholder-notice">No reviews yet.</div>
        ) : (
          <div className="tt-review-list">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}



