import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';
import './ReviewCard.css';

const STATUS_META = {
  completed: { label: 'Completed', cls: 'tt-badge-aqua'  },
  watching:  { label: 'Watching',  cls: 'tt-badge-gold'  },
  dropped:   { label: 'Dropped',   cls: 'tt-badge-muted' },
};

function ReadOnlyStars({ value }) {
  return (
    <div className="tt-ro-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`tt-ro-star${value >= s ? ' tt-ro-star-on' : ''}`}>★</span>
      ))}
    </div>
  );
}

export default function ReviewCard({ review, reviewer, showEditLink = false, onDelete }) {
  const { id, show_title, rating, status, review_text, created_at } = review;
  const meta    = STATUS_META[status] ?? STATUS_META.watching;
  const snippet = review_text
    ? review_text.length > 140 ? review_text.slice(0, 140) + '…' : review_text
    : null;
  const date = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    setDeleting(false);
    if (error) { setDeleteError(error.message); return; }
    onDelete?.(id);
  }

  return (
    <article className="tt-review-card">
      <div className="tt-review-card-header">
        <div className="tt-review-card-meta">
          <h3 className="tt-review-card-title">{show_title}</h3>
          <ReadOnlyStars value={rating} />
        </div>
        <span className={`tt-badge ${meta.cls}`}>{meta.label}</span>
      </div>

      {snippet && <p className="tt-review-card-snippet">{snippet}</p>}

      {deleteError && (
        <p className="tt-review-card-delete-error" role="alert">{deleteError}</p>
      )}

      <div className="tt-review-card-footer">
        <div className="tt-review-card-footer-left">
          {reviewer && (
            <Link to={`/profile/${reviewer.id}`} className="tt-reviewer-byline">
              <Avatar src={reviewer.avatar_url} username={reviewer.username} size={22} />
              <span className="tt-reviewer-name">{reviewer.username ?? 'Anonymous'}</span>
            </Link>
          )}
          <span className="tt-review-card-date">{date}</span>
        </div>

        {showEditLink && (
          <div className="tt-review-card-actions">
            {confirming ? (
              <>
                <span className="tt-review-card-confirm-label">Delete this review?</span>
                <button
                  className="tt-btn-inline tt-btn-inline-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  className="tt-btn-inline"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/cartoons/${encodeURIComponent(show_title)}/review/${id}/edit`}
                  className="tt-btn-inline"
                >
                  Edit
                </Link>
                <button
                  className="tt-btn-inline tt-btn-inline-danger"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
