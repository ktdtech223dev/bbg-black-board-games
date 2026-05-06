export default function CloutIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <rect x="9" y="4" width="14" height="24" rx="2" fill="#cc88ff" stroke="#7755aa" strokeWidth="1.2" />
      <rect x="11" y="7" width="10" height="14" fill="#0a0010" />
      <circle cx="16" cy="25" r="1.2" fill="#7755aa" />
      <path d="M 14 11 Q 16 8 18 11" stroke="#fff" strokeWidth="1" fill="none" />
      <path d="M 13 13 Q 16 9 19 13" stroke="#fff" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 12 15 Q 16 10 20 15" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}
