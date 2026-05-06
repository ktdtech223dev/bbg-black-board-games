export default function ConnectIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <ellipse cx="11" cy="16" rx="6" ry="4" fill="none" stroke="#22aacc" strokeWidth="2.5" transform="rotate(-30 11 16)" />
      <ellipse cx="21" cy="16" rx="6" ry="4" fill="none" stroke="#22aacc" strokeWidth="2.5" transform="rotate(-30 21 16)" />
      <ellipse cx="11" cy="16" rx="6" ry="4" fill="none" stroke="#88ddff" strokeWidth="0.7" transform="rotate(-30 11 16)" />
      <ellipse cx="21" cy="16" rx="6" ry="4" fill="none" stroke="#88ddff" strokeWidth="0.7" transform="rotate(-30 21 16)" />
    </svg>
  );
}
