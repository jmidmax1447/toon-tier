import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ReviewForm from '../components/ReviewForm';

export default function EditReview() {
  const { id, reviewId } = useParams();
  const { user }         = useAuth();
  const navigate         = useNavigate();

  const [review,      setReview]      = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError,  setFetchError]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  useEffect(() => {
    async function fetchReview() {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error || !data) {
        setFetchError('Review not found.');
      } else if (data.user_id !== user?.id) {
        setFetchError("You don't have permission to edit this review.");
      } else {
        setReview(data);
      }
      setFetchLoading(false);
    }

    fetchReview();
  }, [reviewId, user]);

  async function handleSubmit(values) {
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from('reviews')
      .update(values)
      .eq('id', reviewId);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    navigate(`/cartoons/${id}`);
  }

  if (fetchLoading) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-list-status">Loading review…</p>
    </div></div>
  );

  if (fetchError) return (
    <div className="tt-page"><div className="tt-page-inner">
      <p className="tt-auth-error" role="alert" style={{ marginTop: '1rem' }}>{fetchError}</p>
    </div></div>
  );

  return (
    <div className="tt-page">
      <div className="tt-page-inner tt-review-form-wrap">
        <h1 className="tt-page-title">Edit Review</h1>
        <p className="tt-page-sub">{review.show_title}</p>

        {saveError && (
          <p className="tt-auth-error" role="alert" style={{ marginTop: '1rem' }}>{saveError}</p>
        )}

        <ReviewForm
          initial={review}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Update Review"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
