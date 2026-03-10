import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function validate(email, password, confirm) {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

export default function Signup() {
  const { signUp } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate(email, password, confirm);
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    const { error: authError } = await signUp(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="tt-auth-page">
        <div className="tt-auth-card tt-auth-card-center">
          <span className="tt-auth-success-icon">📬</span>
          <h2 className="tt-auth-title">Check your inbox</h2>
          <p className="tt-auth-sub">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="tt-btn tt-btn-primary" style={{ marginTop: '1.5rem' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tt-auth-page">
      <div className="tt-auth-card">
        <h1 className="tt-auth-title">
          Join <span className="tt-accent-pink">ToonTier</span>
        </h1>
        <p className="tt-auth-sub">Create your free account</p>

        <form className="tt-auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="tt-auth-error" role="alert">{error}</p>}

          <label className="tt-field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="tt-input"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="tt-field-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="tt-input"
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <label className="tt-field-label" htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            className={`tt-input${error === 'Passwords do not match.' ? ' tt-input-error' : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />

          <button
            type="submit"
            className="tt-btn tt-btn-primary tt-btn-full"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="tt-auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="tt-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
