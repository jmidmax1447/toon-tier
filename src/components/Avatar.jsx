import './Avatar.css';

export default function Avatar({ src, username, size = 72 }) {
  const initial = (username ?? '?').charAt(0).toUpperCase();
  return src ? (
    <img
      src={src}
      alt={username ?? 'Avatar'}
      className="tt-avatar-img"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="tt-avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={username ?? 'Avatar'}
    >
      {initial}
    </div>
  );
}
