import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="tt-root">
      <section className="tt-hero">
        <div className="tt-hero-glow tt-glow-pink" />
        <div className="tt-hero-glow tt-glow-aqua" />

        <div className="tt-hero-content">
          <h1 className="tt-hero-title">
            Toon<span className="tt-accent-pink">Tier</span>
          </h1>
          <p className="tt-hero-desc">
            Track and review every animated show you've watched. Rate cartoons,
            write short reviews, and organise your viewing history — all in one place.
          </p>
          <div className="tt-hero-actions">
            <Link to="/signup" className="tt-btn tt-btn-primary">Get Started</Link>
            <Link to="/cartoons" className="tt-btn tt-btn-ghost">Browse Cartoons</Link>
          </div>
        </div>

        <div className="tt-hero-badge-grid" aria-hidden="true">
          {['🎬', '⭐', '📺', '🏆', '🎨', '✏️'].map((emoji, i) => (
            <span key={i} className="tt-emoji-badge" style={{ '--i': i }}>{emoji}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
