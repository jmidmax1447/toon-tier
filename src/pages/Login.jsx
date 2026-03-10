import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function validate(email, password) {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export default function Login() {
  const { signIn }  = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate(email, password);
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Redirect back to the page that triggered the login, or fall back to profile
    const from = location.state?.from?.pathname || '/profile';
    navigate(from, { replace: true });
  }

  return (
    <div className="tt-auth-page">
      <div className="tt-auth-card">
        <h1 className="tt-auth-title">
          Welcome back to <span className="tt-accent-pink">ToonTier</span>
        </h1>
        <p className="tt-auth-sub">Sign in to your account</p>

        <form className="tt-auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="tt-auth-error" role="alert">{error}</p>}

          <label className="tt-field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`tt-input${error && !email.trim() ? ' tt-input-error' : ''}`}
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
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="tt-btn tt-btn-primary tt-btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="tt-auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="tt-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
