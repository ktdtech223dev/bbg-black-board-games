export default function MuscleIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path d="M 5 13 L 12 11 L 14 8 L 18 8 L 20 11 L 27 13 L 27 18 L 24 19 L 22 24 L 12 24 L 10 19 L 5 18 Z"
            fill="#cc2222" stroke="#661111" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M 13 13 L 13 21" stroke="#881111" strokeWidth="1" />
      <path d="M 19 13 L 19 21" stroke="#881111" strokeWidth="1" />
      <circle cx="16" cy="16" r="2" fill="#881111" />
    </svg>
  );
}
