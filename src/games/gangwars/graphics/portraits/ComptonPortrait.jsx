export default function ComptonPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cp-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#2255cc" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#050810" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill="#050810" />
      <rect width="200" height="280" fill="url(#cp-glow)" />

      <g opacity="0.6">
        <rect x="40" y="250" width="20" height="6" fill="#22cc55" />
        <rect x="44" y="244" width="20" height="6" fill="#1aa544" />
        <rect x="140" y="252" width="22" height="6" fill="#22cc55" />
        <rect x="138" y="246" width="22" height="6" fill="#1aa544" />
      </g>
      <ellipse cx="100" cy="263" rx="58" ry="8" fill="rgba(34,85,204,0.3)" />

      <rect x="72" y="195" width="22" height="65" rx="6" fill="#0d1830" />
      <rect x="106" y="195" width="22" height="65" rx="6" fill="#0d1830" />
      <rect x="63" y="248" width="34" height="12" rx="4" fill="#fff" />
      <rect x="103" y="248" width="34" height="12" rx="4" fill="#fff" />
      <rect x="63" y="248" width="34" height="5" fill="#2255cc" />
      <rect x="103" y="248" width="34" height="5" fill="#2255cc" />

      <path d="M 55 130 L 50 200 L 150 200 L 145 130 L 125 118 L 75 118 Z" fill="#1a2440" />
      <path d="M 55 140 Q 80 145 100 150 Q 130 145 145 140 L 148 158 Q 130 152 100 156 Q 80 152 52 158 Z" fill="#101a30" />

      <path d="M 70 160 Q 80 145 95 150 L 95 145 L 75 145 Z" fill="#222" transform="rotate(-15 80 150)" />
      <g transform="translate(110 145)">
        <rect x="0" y="0" width="22" height="13" rx="2" fill="#22cc55" />
        <rect x="0" y="0" width="22" height="13" rx="2" fill="none" stroke="#1aa544" />
        <text x="11" y="9" textAnchor="middle" fill="#0a3a14" fontSize="7" fontFamily="monospace" fontWeight="bold">$$$</text>
      </g>

      <path d="M 75 130 Q 100 145 125 130" stroke="#c8a84b" strokeWidth="2.5" fill="none" />
      <circle cx="100" cy="142" r="2.5" fill="#c8a84b" />

      <rect x="90" y="100" width="20" height="20" rx="3" fill="#7a543a" />
      <ellipse cx="100" cy="85" rx="28" ry="32" fill="#8a624a" />

      <path d="M 70 75 Q 70 50 100 50 Q 130 50 130 75 L 130 78 L 70 78 Z" fill="#0d1830" />
      <rect x="68" y="76" width="64" height="5" fill="#0a142a" />
      <rect x="93" y="63" width="14" height="10" rx="2" fill="#c8a84b" />
      <text x="100" y="71" textAnchor="middle" fill="#0a0a0a" fontSize="8" fontFamily="monospace" fontWeight="bold">C</text>

      <ellipse cx="92" cy="92" rx="3.5" ry="2.5" fill="#222" />
      <ellipse cx="108" cy="92" rx="3.5" ry="2.5" fill="#222" />
      <path d="M 92 105 Q 100 109 108 105" stroke="#3a2010" strokeWidth="2" fill="none" />

      <text x="100" y="270" textAnchor="middle" fill="#2255cc" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        COMPTON
      </text>
    </svg>
  );
}
