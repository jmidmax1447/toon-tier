import { useState } from 'react';
import './StarRating.css';

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="tt-stars" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`tt-star${display >= star ? ' tt-star-filled' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="tt-star-label">{value} / 5</span>
      )}
    </div>
  );
}
