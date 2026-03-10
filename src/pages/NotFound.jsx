import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="tt-notfound">
      <div className="tt-notfound-content">
        <span className="tt-notfound-emoji">📺</span>
        <h1 className="tt-notfound-code">404</h1>
        <p className="tt-notfound-msg">
          This channel doesn't exist — or it got cancelled.
        </p>
        <Link to="/" className="tt-btn tt-btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
