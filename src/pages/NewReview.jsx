import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ReviewForm from '../components/ReviewForm';
import { useState } from 'react';

export default function NewReview() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  // Prefer title passed via Link state; fall back to decoding the URL param
  const showTitle    = location.state?.showTitle ?? decodeURIComponent(id);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleSubmit(values) {
    setLoading(true);
    setError(null);
    const { error: dbError } = await supabase.from('reviews').insert({
      user_id: user.id,
      ...values,
    });
    setLoading(false);
    if (dbError) { setError(dbError.message); return; }
    navigate(`/cartoons/${id}`);
  }

  return (
    <div className="tt-page">
      <div className="tt-page-inner tt-review-form-wrap">
        <h1 className="tt-page-title">Write a Review</h1>
        <p className="tt-page-sub">For <strong>{showTitle}</strong></p>

        {error && <p className="tt-auth-error" role="alert" style={{ marginTop: '1rem' }}>{error}</p>}

        <ReviewForm
          initial={{ show_title: showTitle }}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save Review"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
