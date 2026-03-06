import './App.css';

function App() {
  return (
    <div className="tt-root">

      {/* ── Nav ── */}
      <nav className="tt-nav">
        <span className="tt-nav-logo">
          Toon<span className="tt-nav-logo-accent">Tier</span>
        </span>
      </nav>

      {/* ── Hero ── */}
      <section className="tt-hero">
        <div className="tt-hero-glow tt-glow-pink" />
        <div className="tt-hero-glow tt-glow-aqua" />
        <div className="tt-hero-content">
          <h1 className="tt-hero-title">
            Toon<span className="tt-accent-pink">Tier</span>
          </h1>
          <p className="tt-hero-desc">
            Toon Tier is a web application where users can track and review animated
            shows they have watched. Users can rate cartoons, write short reviews, and
            organize their viewing history. The app also aims to create a community for
            people who share a passion for animation.
          </p>
        </div>
        <div className="tt-hero-badge-grid" aria-hidden="true">
          {['🎬', '⭐', '📺', '🏆', '🎨', '✏️'].map((emoji, i) => (
            <span key={i} className="tt-emoji-badge" style={{ '--i': i }}>{emoji}</span>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="tt-footer">
        <span className="tt-nav-logo">
          Toon<span className="tt-nav-logo-accent">Tier</span>
        </span>
        <p>© {new Date().getFullYear()} ToonTier. Made with ❤️ for animation fans.</p>
      </footer>

    </div>
  );
}

export default App;
