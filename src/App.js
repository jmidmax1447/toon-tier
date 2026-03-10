import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home        from './pages/Home';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Cartoons    from './pages/Cartoons';
import CartoonDetail from './pages/CartoonDetail';
import NewReview   from './pages/NewReview';
import EditReview  from './pages/EditReview';
import Profile     from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import NotFound    from './pages/NotFound';

import './App.css';
import './pages/Pages.css';
import './pages/AuthPages.css';
import './pages/Cartoons.css';

function Nav() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="tt-nav">
      <Link to="/" className="tt-nav-logo">
        Toon<span className="tt-nav-logo-accent">Tier</span>
      </Link>

      <div className="tt-nav-links">
        <NavLink to="/cartoons" className="tt-nav-link">Cartoons</NavLink>

        {/* Suppress auth links until session is resolved to prevent flicker */}
        {!loading && (user ? (
          <>
            <NavLink to="/profile" className="tt-nav-link">Profile</NavLink>
            <button
              className="tt-btn tt-btn-ghost tt-btn-sm"
              onClick={signOut}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"  className="tt-nav-link">Login</NavLink>
            <Link    to="/signup" className="tt-btn tt-btn-primary tt-btn-sm">Sign Up</Link>
          </>
        ))}
      </div>
    </nav>
  );
}

function AppShell() {
  return (
    <div className="tt-root">
      <Nav />

      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/cartoons"    element={<Cartoons />} />
        <Route path="/cartoons/:id" element={<CartoonDetail />} />

        <Route path="/cartoons/:id/review/new" element={
          <ProtectedRoute><NewReview /></ProtectedRoute>
        } />
        <Route path="/cartoons/:id/review/:reviewId/edit" element={
          <ProtectedRoute><EditReview /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={<PublicProfile />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="tt-footer">
        <span className="tt-nav-logo">
          Toon<span className="tt-nav-logo-accent">Tier</span>
        </span>
        <p>© {new Date().getFullYear()} ToonTier. Made with ❤️ for animation fans.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

