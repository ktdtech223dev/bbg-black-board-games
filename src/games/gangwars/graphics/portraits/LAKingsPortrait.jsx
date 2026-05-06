export default function LAKingsPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="la-glow" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#cc88ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0a0510" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="la-spot" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="280" fill="#0a0510" />
      <rect width="200" height="280" fill="url(#la-glow)" />
      <polygon points="80,0 120,0 145,120 55,120" fill="url(#la-spot)" />
      <ellipse cx="100" cy="263" rx="56" ry="8" fill="rgba(136,34,204,0.35)" />

      <rect x="74" y="195" width="22" height="65" rx="5" fill="#1a0d22" />
      <rect x="104" y="195" width="22" height="65" rx="5" fill="#1a0d22" />
      <rect x="68" y="248" width="32" height="12" rx="4" fill="#fff" />
      <rect x="100" y="248" width="32" height="12" rx="4" fill="#fff" />
      <rect x="68" y="248" width="32" height="4" fill="#c8a84b" />
      <rect x="100" y="248" width="32" height="4" fill="#c8a84b" />

      <path d="M 55 125 L 50 200 L 150 200 L 145 125 L 125 113 L 75 113 Z" fill="#1a0d22" />

      <path d="M 50 130 Q 30 145 28 165 L 38 170 L 45 200 L 70 200 L 60 145 Z" fill="#1a0d22" />
      <path d="M 150 130 Q 170 145 172 165 L 162 170 L 155 200 L 130 200 L 140 145 Z" fill="#1a0d22" />

      <ellipse cx="34" cy="155" rx="6" ry="8" fill="#0d0518" />
      <ellipse cx="166" cy="155" rx="6" ry="8" fill="#0d0518" />

      <path d="M 55 130 L 145 130 L 142 145 L 58 145 Z" fill="#0d0518" />
      <text x="100" y="142" textAnchor="middle" fill="#c8a84b" fontSize="6" fontFamily="monospace" letterSpacing="3" opacity="0.6">DESIGNER</text>

      <path d="M 75 145 Q 100 158 125 145" stroke="#c8a84b" strokeWidth="3" fill="none" />
      <polygon points="100,158 96,164 100,162 104,164" fill="#c8a84b" />

      <rect x="91" y="98" width="18" height="20" rx="3" fill="#7a543a" />
      <ellipse cx="100" cy="83" rx="28" ry="32" fill="#8a624a" />

      <path d="M 70 75 Q 75 50 100 50 Q 125 50 130 75" fill="none" stroke="#3a2410" strokeWidth="3" />
      <path d="M 70 75 L 130 75 L 130 80 L 70 80 Z" fill="#1a0d22" />

      <rect x="80" y="84" width="40" height="12" rx="6" fill="#0a0510" />
      <rect x="80" y="84" width="18" height="12" rx="6" fill="#1a0d22" />
      <rect x="102" y="84" width="18" height="12" rx="6" fill="#1a0d22" />
      <line x1="98" y1="90" x2="102" y2="90" stroke="#1a0d22" strokeWidth="2" />
      <ellipse cx="89" cy="90" rx="6" ry="4" fill="#cc88ff" opacity="0.4" />
      <ellipse cx="111" cy="90" rx="6" ry="4" fill="#cc88ff" opacity="0.4" />

      <line x1="93" y1="106" x2="107" y2="106" stroke="#3a2010" strokeWidth="2" />

      <text x="100" y="270" textAnchor="middle" fill="#cc88ff" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        LA KINGS
      </text>
    </svg>
  );
}
