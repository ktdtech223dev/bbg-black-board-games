export default function OperationPiece({ color = '#fff', size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <rect x="4" y="14" width="24" height="14" fill="#1a1a1a" stroke={color} strokeWidth="1.2" />
      <rect x="4" y="10" width="24" height="6" fill={color} />
      <rect x="6" y="11" width="20" height="3" fill={color} opacity="0.6" />
      <rect x="8" y="18" width="6" height="6" fill="#080810" />
      <rect x="18" y="18" width="6" height="6" fill="#080810" />
      <text x="16" y="14.5" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fontWeight="bold" fill="#0a0a0a">OP</text>
    </svg>
  );
}
