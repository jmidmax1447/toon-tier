import './StatsPanel.css';

function avgRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
}

function topRated(reviews) {
  if (!reviews.length) return null;
  return reviews.reduce((best, r) => {
    if (r.rating > best.rating) return r;
    if (r.rating === best.rating && r.created_at > best.created_at) return r;
    return best;
  });
}

function topGenre(reviews, cartoonGenres) {
  if (!cartoonGenres || !reviews.length) return null;
  const counts = {};
  for (const r of reviews) {
    const genre = cartoonGenres[r.show_title];
    if (genre) counts[genre] = (counts[genre] || 0) + 1;
  }
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  return entries.reduce((best, curr) => curr[1] > best[1] ? curr : best);
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div className={`tt-stat-card${accent ? ` tt-stat-card-${accent}` : ''}`}>
      <span className="tt-stat-icon">{icon}</span>
      <span className="tt-stat-value">{value}</span>
      <span className="tt-stat-label">{label}</span>
    </div>
  );
}

function MiniStars({ value }) {
  return (
    <span className="tt-mini-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`tt-mini-star${value >= s ? ' tt-mini-star-on' : ''}`}>★</span>
      ))}
    </span>
  );
}

export default function StatsPanel({ reviews, cartoonGenres, title = 'Your Stats' }) {
  if (!reviews.length) return null;

  const total     = reviews.length;
  const avg       = avgRating(reviews);
  const completed = reviews.filter(r => r.status === 'completed').length;
  const watching  = reviews.filter(r => r.status === 'watching').length;
  const dropped   = reviews.filter(r => r.status === 'dropped').length;
  const top       = topRated(reviews);
  const genre     = topGenre(reviews, cartoonGenres);

  return (
    <div className="tt-stats-panel">
      <h2 className="tt-section-title" style={{ marginBottom: '1rem' }}>{title}</h2>

      {/* ── Main stat cards ── */}
      <div className="tt-stats-grid">
        <StatCard icon="📝" value={total}     label="Total Reviews" />
        <StatCard icon="⭐" value={avg}        label="Avg Rating"    accent="gold" />
        <StatCard icon="✅" value={completed} label="Completed"     accent="aqua" />
        <StatCard icon="📺" value={watching}  label="Watching"      />
      </div>

      {dropped > 0 && (
        <p className="tt-stats-dropped">
          ❌ <strong>{dropped}</strong> dropped
        </p>
      )}

      {/* ── Most reviewed genre ── */}
      {genre && (
        <div className="tt-stats-genre">
          <span className="tt-stats-genre-icon">🎭</span>
          <div className="tt-stats-top-body">
            <span className="tt-stats-genre-label">Most Reviewed Genre</span>
            <span className="tt-stats-genre-name">{genre[0]}</span>
            <span className="tt-stats-genre-count">{genre[1]} review{genre[1] !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* ── Top-rated show ── */}
      {top && !genre && (
        <div className="tt-stats-top">
          <span className="tt-stats-top-trophy">🏆</span>
          <div className="tt-stats-top-body">
            <span className="tt-stats-top-label">Top Rated</span>
            <span className="tt-stats-top-title">{top.show_title}</span>
            <MiniStars value={top.rating} />
          </div>
        </div>
      )}
    </div>
  );
}

