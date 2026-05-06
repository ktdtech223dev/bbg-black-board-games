export default function FlagPiece({ color = '#fff', size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <line x1="8" y1="4" x2="8" y2="28" stroke="#666" strokeWidth="1.5" />
      <circle cx="8" cy="4" r="1.5" fill="#c8a84b" />
      <polygon points="8,5 24,8 24,18 8,15"
               fill={color}
               className="flag-wave"
               style={{ transformOrigin: '8px 10px' }} />
      <polygon points="8,5 24,8 24,18 8,15" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
