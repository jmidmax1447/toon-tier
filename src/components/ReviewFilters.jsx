import './ReviewFilters.css';

const STATUS_OPTS = [
  { value: '',          label: 'All'          },
  { value: 'watching',  label: '📺 Watching'  },
  { value: 'completed', label: '✅ Completed' },
  { value: 'dropped',   label: '❌ Dropped'   },
];

const RATING_OPTS = [
  { value: 0, label: 'All' },
  { value: 3, label: '3★+' },
  { value: 4, label: '4★+' },
  { value: 5, label: '5★'  },
];

export default function ReviewFilters({
  statusFilter,
  ratingFilter,
  onStatusChange,
  onRatingChange,
  total,
  filtered,
  onReset,
}) {
  const isFiltered = statusFilter !== '' || ratingFilter > 0;

  return (
    <div className="tt-filters">
      <div className="tt-filter-row">
        <div className="tt-filter-group">
          <span className="tt-filter-label">Status</span>
          <div className="tt-filter-pills">
            {STATUS_OPTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`tt-filter-pill${statusFilter === opt.value ? ' tt-filter-pill-active' : ''}`}
                onClick={() => onStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tt-filter-group">
          <span className="tt-filter-label">Rating</span>
          <div className="tt-filter-pills">
            {RATING_OPTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`tt-filter-pill${ratingFilter === opt.value ? ' tt-filter-pill-active' : ''}`}
                onClick={() => onRatingChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFiltered && (
        <div className="tt-filter-summary">
          <span className="tt-filter-count">
            {filtered} of {total} review{total !== 1 ? 's' : ''}
          </span>
          <button type="button" className="tt-btn-inline" onClick={onReset}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
