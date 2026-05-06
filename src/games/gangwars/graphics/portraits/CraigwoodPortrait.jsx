export default function CraigwoodPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cw-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#cc6600" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a0500" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill="#0a0500" />
      <rect width="200" height="280" fill="url(#cw-glow)" />

      {[...Array(8)].map((_, i) => (
        <line key={i} x1={20 + i * 22} y1={20} x2={50 + i * 18} y2={250}
          stroke="#cc6600" strokeWidth="0.5" opacity={0.18 + (i % 3) * 0.05} />
      ))}
      <ellipse cx="100" cy="263" rx="60" ry="9" fill="rgba(204,102,0,0.32)" />

      <rect x="68" y="195" width="22" height="65" rx="5" fill="#1a0d05" transform="rotate(-3 79 230)" />
      <rect x="110" y="195" width="22" height="65" rx="5" fill="#1a0d05" transform="rotate(3 121 230)" />
      <rect x="60" y="248" width="34" height="12" rx="4" fill="#222" transform="rotate(-3 77 254)" />
      <rect x="106" y="248" width="34" height="12" rx="4" fill="#222" transform="rotate(3 123 254)" />

      <path d="M 50 130 L 45 200 L 155 200 L 150 130 L 130 110 L 70 110 Z" fill="#220e02" />
      <path d="M 60 145 L 140 145 L 142 165 L 58 165 Z" fill="#cc6600" opacity="0.15" />

      <path d="M 50 145 Q 70 130 95 138 L 100 200 L 70 200 Z" fill="#1a0805" />
      <path d="M 150 145 Q 130 130 105 138 L 100 200 L 130 200 Z" fill="#1a0805" />

      <ellipse cx="62" cy="180" rx="10" ry="14" fill="#1a0805" />
      <ellipse cx="138" cy="180" rx="10" ry="14" fill="#1a0805" />

      <g transform="translate(60 178) rotate(-25)">
        <rect x="-2" y="-2" width="14" height="3" fill="#444" />
      </g>
      <g transform="translate(140 178) rotate(25)">
        <rect x="-12" y="-2" width="14" height="3" fill="#444" />
      </g>

      <path d="M 66 138 L 80 145 L 78 160 L 66 152 Z" fill="#cc6600" opacity="0.4" />
      <path d="M 134 138 L 120 145 L 122 160 L 134 152 Z" fill="#cc6600" opacity="0.4" />

      <rect x="91" y="98" width="18" height="20" rx="3" fill="#5a3a26" />
      <ellipse cx="100" cy="80" rx="30" ry="34" fill="#6a4530" transform="skewY(8)" />

      <path d="M 95 65 L 102 68 L 105 78 L 96 76 Z" fill="#3a2010" opacity="0.5" />

      <ellipse cx="91" cy="86" rx="3.5" ry="2.5" fill="#cc6600" />
      <ellipse cx="109" cy="86" rx="3.5" ry="2.5" fill="#cc6600" />
      <ellipse cx="91" cy="86" rx="1.8" ry="1.3" fill="#1a0500" />
      <ellipse cx="109" cy="86" rx="1.8" ry="1.3" fill="#1a0500" />

      <path d="M 88 100 L 92 105 L 108 105 L 112 100" stroke="#1a0500" strokeWidth="2" fill="#1a0500" />
      <line x1="92" y1="105" x2="108" y2="105" stroke="#fff" strokeWidth="0.8" />

      <text x="100" y="270" textAnchor="middle" fill="#cc6600" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        CRAIGWOOD
      </text>
    </svg>
  );
}
