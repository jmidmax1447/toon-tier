import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import ReviewCard from '../components/ReviewCard';
import ReviewFilters from '../components/ReviewFilters';
import StatsPanel from '../components/StatsPanel';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();

  // ── Profile state ──
  const [profile,        setProfile]        = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing,        setEditing]        = useState(false);
  const [username,       setUsername]       = useState('');
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [uploading,      setUploading]      = useState(false);
  const [uploadError,    setUploadError]    = useState(null);

  // ── Reviews state ──
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      const [profileRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setUsername(profileRes.data.username ?? '');
      }
      setProfileLoading(false);

      if (!reviewsRes.error) setReviews(reviewsRes.data ?? []);
      setLoading(false);
    }

    fetchAll();
  }, [user]);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be under 2 MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    // Save URL to profiles table
    const { data: updated, error: profileErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: profile?.username ?? username, avatar_url: publicUrl })
      .select()
      .single();

    if (profileErr) {
      setUploadError(profileErr.message);
      setUploading(false);
      return;
    }

    // Append cache-buster so the browser re-fetches the new image immediately
    const fresh = `${publicUrl}?t=${Date.now()}`;
    setProfile({ ...updated, avatar_url: fresh });
    setUploading(false);
    e.target.value = '';
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: username.trim(), avatar_url: profile?.avatar_url ?? null })
      .select()
      .single();

    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setProfile(data);
    setEditing(false);
  }

  function cancelEdit() {
    setUsername(profile?.username ?? '');
    setSaveError(null);
    setUploadError(null);
    setEditing(false);
  }

  const displayName = profile?.username || user?.email;

  const filteredReviews = reviews
    .filter(r => !statusFilter || r.status === statusFilter)
    .filter(r => !ratingFilter || r.rating >= ratingFilter);

  function resetFilters() {
    setStatusFilter('');
    setRatingFilter(0);
  }

  return (
    <div className="tt-page">
      <div className="tt-page-inner">

        {/* ── Profile header ── */}
        <div className="tt-profile-header">
          {!profileLoading && (
            <Avatar src={profile?.avatar_url} username={displayName} size={72} />
          )}
          <div className="tt-profile-header-info">
            <h1 className="tt-page-title" style={{ marginBottom: '0.1rem' }}>
              {profileLoading ? '…' : (profile?.username || 'Your Profile')}
            </h1>
            <p className="tt-page-sub" style={{ marginBottom: 0 }}>{user?.email}</p>
          </div>
          {!editing && (
            <button
              className="tt-btn tt-btn-ghost tt-btn-sm tt-profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* ── Edit form ── */}
        {editing && (
          <form className="tt-profile-edit-form" onSubmit={handleSave} noValidate>
            {saveError && <p className="tt-auth-error" role="alert">{saveError}</p>}

            {/* ── Avatar upload ── */}
            <div className="tt-avatar-upload-row">
              <Avatar src={profile?.avatar_url} username={username || displayName} size={56} />
              <div className="tt-avatar-upload-controls">
                <label className="tt-btn tt-btn-ghost tt-btn-sm tt-avatar-upload-btn" aria-busy={uploading}>
                  {uploading ? 'Uploading…' : 'Change Avatar'}
                  <input
                    type="file"
                    accept="image/*"
                    className="tt-avatar-file-input"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
                <span className="tt-avatar-upload-hint">JPG, PNG, GIF · max 2 MB</span>
              </div>
            </div>
            {uploadError && <p className="tt-auth-error" role="alert">{uploadError}</p>}

            <label className="tt-field-label" htmlFor="prof-username">Username</label>
            <input
              id="prof-username"
              type="text"
              className="tt-input"
              placeholder="your_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />

            <div className="tt-review-form-actions">
              <button type="button" className="tt-btn tt-btn-ghost" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="tt-btn tt-btn-primary" disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ── Stats ── */}
        <StatsPanel reviews={reviews} />

        {/* ── Reviews ── */}
        <div className="tt-section-header">
          <h2 className="tt-section-title">
            Your Reviews {!loading && reviews.length > 0 && `(${reviews.length})`}
          </h2>
          <Link to="/cartoons" className="tt-btn tt-btn-ghost tt-btn-sm">
            + Add Review
          </Link>
        </div>

        {loading && <p className="tt-list-status">Loading reviews…</p>}

        {!loading && reviews.length === 0 && (
          <div className="tt-placeholder-notice">
            <p>No reviews yet.</p>
            <Link to="/cartoons" className="tt-link" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              Browse cartoons to get started →
            </Link>
          </div>
        )}

        {!loading && reviews.length > 0 && (
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
                    showEditLink
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

