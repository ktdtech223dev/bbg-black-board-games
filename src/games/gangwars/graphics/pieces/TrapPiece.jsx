export default function TrapPiece({ color = '#fff', size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <polygon points="16,4 28,12 28,28 4,28 4,12" fill="#0d0d18" stroke={color} strokeWidth="1.2" />
      <polygon points="16,4 28,12 4,12" fill="#1a1a26" stroke={color} strokeWidth="0.8" />
      <rect x="9" y="16" width="6" height="6" fill={color} opacity="0.7" />
      <line x1="9" y1="16" x2="15" y2="22" stroke="#080810" strokeWidth="1" />
      <line x1="15" y1="16" x2="9" y2="22" stroke="#080810" strokeWidth="1" />
      <rect x="18" y="16" width="6" height="6" fill="#080810" />
      <line x1="21" y1="16" x2="21" y2="22" stroke="#222" />
      <rect x="14" y="22" width="4" height="6" fill="#080810" />
    </svg>
  );
}
