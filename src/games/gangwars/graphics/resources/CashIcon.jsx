export default function CashIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <rect x="3" y="14" width="26" height="14" rx="1.5" fill="#1aaa44" stroke="#0d6622" strokeWidth="1" />
      <rect x="5" y="11" width="26" height="14" rx="1.5" fill="#22cc55" stroke="#0d6622" strokeWidth="1" />
      <rect x="7" y="8" width="26" height="14" rx="1.5" fill="#22cc55" stroke="#0d6622" strokeWidth="1" transform="translate(-2 0)" />
      <circle cx="20" cy="15" r="4.5" fill="#1aa544" stroke="#0d6622" strokeWidth="0.7" />
      <text x="20" y="18" textAnchor="middle" fill="#0a3a14" fontSize="9" fontFamily="monospace" fontWeight="bold">$</text>
    </svg>
  );
}
