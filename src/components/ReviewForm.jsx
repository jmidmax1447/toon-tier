import { useState } from 'react';
import StarRating from './StarRating';
import './ReviewForm.css';

const STATUS_OPTIONS = [
  { value: 'completed', label: '✅ Completed' },
  { value: 'watching',  label: '📺 Watching'  },
  { value: 'dropped',   label: '❌ Dropped'   },
];

function validate(showTitle, rating, status) {
  if (!showTitle.trim()) return 'Show title is required.';
  if (rating === 0)      return 'Please select a star rating.';
  if (!status)           return 'Please select a watch status.';
  return null;
}

export default function ReviewForm({
  initial      = {},
  onSubmit,
  loading      = false,
  submitLabel  = 'Save Review',
  onCancel,
}) {
  const [showTitle,  setShowTitle]  = useState(initial.show_title  ?? '');
  const [rating,     setRating]     = useState(initial.rating      ?? 0);
  const [status,     setStatus]     = useState(initial.status      ?? '');
  const [reviewText, setReviewText] = useState(initial.review_text ?? '');
  const [error,      setError]      = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate(showTitle, rating, status);
    if (validationError) { setError(validationError); return; }
    setError(null);
    await onSubmit({
      show_title:  showTitle.trim(),
      rating,
      status,
      review_text: reviewText.trim() || null,
    });
  }

  return (
    <form className="tt-review-form" onSubmit={handleSubmit} noValidate>
      {error && <p className="tt-auth-error" role="alert">{error}</p>}

      <label className="tt-field-label" htmlFor="rf-show-title">Show Title</label>
      <input
        id="rf-show-title"
        type="text"
        className="tt-input"
        placeholder="e.g. Avatar: The Last Airbender"
        value={showTitle}
        onChange={e => setShowTitle(e.target.value)}
      />

      <span className="tt-field-label">Your Rating</span>
      <StarRating value={rating} onChange={setRating} />

      <span className="tt-field-label">Watch Status</span>
      <div className="tt-status-group">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`tt-status-btn${status === opt.value ? ' tt-status-btn-active' : ''}`}
            onClick={() => setStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <label className="tt-field-label" htmlFor="rf-review-text">
        Review <span className="tt-field-optional">(optional)</span>
      </label>
      <textarea
        id="rf-review-text"
        className="tt-input tt-textarea"
        placeholder="What did you think?"
        rows={4}
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
      />

      <div className="tt-review-form-actions">
        <button type="button" className="tt-btn tt-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="tt-btn tt-btn-primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
