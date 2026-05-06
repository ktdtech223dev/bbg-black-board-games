export default function OBlockPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ob-glow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#cc2222" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#050508" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill="#050508" />
      <rect width="200" height="280" fill="url(#ob-glow)" />
      <ellipse cx="100" cy="265" rx="55" ry="8" fill="rgba(204,34,34,0.25)" />

      <rect x="72" y="185" width="22" height="70" rx="6" fill="#111" />
      <rect x="106" y="185" width="22" height="70" rx="6" fill="#111" />

      <rect x="65" y="245" width="32" height="14" rx="4" fill="#ffffff" />
      <rect x="99" y="245" width="32" height="14" rx="4" fill="#ffffff" />
      <rect x="65" y="245" width="32" height="6" fill="#cc2222" />
      <rect x="99" y="245" width="32" height="6" fill="#cc2222" />

      <path d="M 60 120 L 55 190 L 145 190 L 140 120 L 120 108 L 80 108 Z" fill="#1a1a1a" />
      <path d="M 55 140 Q 70 150 100 148 Q 130 150 145 140 L 145 160 Q 130 170 100 168 Q 70 170 55 160 Z" fill="#222" />
      <path d="M 60 142 L 140 142" stroke="#333" strokeWidth="2" fill="none" />

      <path d="M 80 125 Q 100 138 120 125" stroke="#c8a84b" strokeWidth="3" fill="none" />
      <circle cx="100" cy="135" r="3" fill="#c8a84b" />

      <rect x="90" y="95" width="20" height="18" rx="4" fill="#4a3728" />
      <ellipse cx="100" cy="82" rx="30" ry="34" fill="#5c3d2e" />

      <path d="M 68 78 Q 65 40 100 35 Q 135 40 132 78 Q 125 70 100 68 Q 75 70 68 78 Z" fill="#1a1a1a" />
      <path d="M 72 82 Q 80 75 100 73 Q 120 75 128 82" fill="#141414" />

      <ellipse cx="100" cy="85" rx="20" ry="18" fill="#3d2416" />
      <ellipse cx="92" cy="82" rx="4" ry="3" fill="#cc2222" />
      <ellipse cx="108" cy="82" rx="4" ry="3" fill="#cc2222" />
      <ellipse cx="92" cy="82" rx="2" ry="1.5" fill="#111" />
      <ellipse cx="108" cy="82" rx="2" ry="1.5" fill="#111" />
      <path d="M 92 96 Q 100 99 108 96" stroke="#2a1408" strokeWidth="2" fill="none" />

      <text x="100" y="270" textAnchor="middle" fill="#cc2222" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        O BLOCK
      </text>
    </svg>
  );
}
