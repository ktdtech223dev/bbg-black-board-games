export default function CardBack({ width = 100, height = 140 }) {
  return (
    <svg viewBox="0 0 100 140" width={width} height={height}>
      <rect width="100" height="140" rx="6" fill="#0d0d18" stroke="#c8a84b" strokeWidth="2" />
      <rect x="4" y="4" width="92" height="132" rx="4" fill="none" stroke="#c8a84b" strokeWidth="0.5" opacity="0.5" />
      <text x="50" y="68" textAnchor="middle" fontFamily="Bebas Neue" fill="#c8a84b" fontSize="22" letterSpacing="3">BBG</text>
      <text x="50" y="84" textAnchor="middle" fontFamily="monospace" fill="#888" fontSize="6" letterSpacing="2">BLACK BOARD GAMES</text>
      <line x1="20" y1="92" x2="80" y2="92" stroke="#c8a84b" strokeWidth="0.5" opacity="0.6" />
      <text x="50" y="124" textAnchor="middle" fontFamily="monospace" fill="#666" fontSize="7" letterSpacing="3">GANG WARS</text>
    </svg>
  );
}
