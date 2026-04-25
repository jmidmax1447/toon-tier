import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageWrapper from './components/PageWrapper';

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
  const location = useLocation();

  return (
    <div className="tt-root">
      <Nav />

      <main className="tt-route-stage">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/cartoons" element={<PageWrapper><Cartoons /></PageWrapper>} />
            <Route path="/cartoons/:id" element={<PageWrapper><CartoonDetail /></PageWrapper>} />

            <Route path="/cartoons/:id/review/new" element={
              <PageWrapper>
                <ProtectedRoute><NewReview /></ProtectedRoute>
              </PageWrapper>
            } />
            <Route path="/cartoons/:id/review/:reviewId/edit" element={
              <PageWrapper>
                <ProtectedRoute><EditReview /></ProtectedRoute>
              </PageWrapper>
            } />

            <Route path="/profile" element={
              <PageWrapper>
                <ProtectedRoute><Profile /></ProtectedRoute>
              </PageWrapper>
            } />
            <Route path="/profile/:userId" element={<PageWrapper><PublicProfile /></PageWrapper>} />

            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

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
