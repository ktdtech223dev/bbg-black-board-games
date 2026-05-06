export default function CardFront({ card, width = 200, height = 280 }) {
  const isEvent = card.type === 'event';
  const accent = isEvent ? '#cc88ff' : '#c8a84b';
  return (
    <svg viewBox="0 0 200 280" width={width} height={height}>
      <rect width="200" height="280" rx="8" fill="#0d0d18" stroke={accent} strokeWidth="2" />
      <rect x="6" y="6" width="188" height="268" rx="6" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.5" />

      <rect x="14" y="14" width="172" height="36" fill="#1a1a26" />
      <text x="100" y="38" textAnchor="middle" fontFamily="Bebas Neue" fill={accent} fontSize="20" letterSpacing="2">
        {(card.name || '').toUpperCase()}
      </text>

      <text x="180" y="32" textAnchor="end" fontFamily="monospace" fill="#888" fontSize="8">
        {(card.rarity || card.type || '').toUpperCase()}
      </text>

      <foreignObject x="14" y="60" width="172" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: 'Rajdhani', color: '#e8e4d8', fontSize: 12, lineHeight: 1.3, padding: 4 }}>
          {card.desc}
        </div>
      </foreignObject>

      <line x1="20" y1="195" x2="180" y2="195" stroke={accent} strokeWidth="0.5" opacity="0.6" />

      <foreignObject x="14" y="200" width="172" height="50">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: 'Rajdhani', color: '#888', fontStyle: 'italic', fontSize: 10, padding: 4 }}>
          {card.flavor}
        </div>
      </foreignObject>

      <rect x="14" y="248" width="172" height="22" fill="#1a1a26" />
      <text x="100" y="263" textAnchor="middle" fontFamily="monospace" fill="#888" fontSize="8" letterSpacing="2">
        {card.cost && Object.keys(card.cost).length > 0
          ? Object.entries(card.cost).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(' · ')
          : 'FREE'}
      </text>
    </svg>
  );
}
