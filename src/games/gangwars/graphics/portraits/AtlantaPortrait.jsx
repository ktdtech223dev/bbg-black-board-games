export default function AtlantaPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="at-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#22aa44" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#040805" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill="#040805" />
      <rect width="200" height="280" fill="url(#at-glow)" />

      {[...Array(12)].map((_, i) => {
        const x = 20 + (i * 17) % 160;
        const y = 50 + (i * 23) % 180;
        return <text key={i} x={x} y={y} fill="#22aa44" opacity="0.18" fontSize="10" fontFamily="monospace">$</text>;
      })}
      <ellipse cx="100" cy="263" rx="55" ry="8" fill="rgba(34,170,68,0.3)" />

      <rect x="74" y="195" width="22" height="65" rx="5" fill="#0a1a10" />
      <rect x="104" y="195" width="22" height="65" rx="5" fill="#0a1a10" />
      <rect x="68" y="248" width="32" height="12" rx="4" fill="#22aa44" />
      <rect x="100" y="248" width="32" height="12" rx="4" fill="#22aa44" />

      <path d="M 60 125 L 58 200 L 142 200 L 140 125 L 122 115 L 78 115 Z" fill="#0e2818" />
      <path d="M 100 125 L 100 200" stroke="#22aa44" strokeWidth="0.5" opacity="0.4" />

      <rect x="68" y="135" width="64" height="14" fill="#fff" opacity="0.05" />
      <text x="100" y="145" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" letterSpacing="2" opacity="0.5">SUPREME</text>

      <path d="M 70 155 Q 100 168 130 155 L 132 175 Q 100 188 68 175 Z" fill="#0a1c10" />

      <g transform="translate(125 152)">
        <rect x="-2" y="-2" width="14" height="6" rx="2" fill="#1a1a1a" />
        <circle cx="5" cy="1" r="3.5" fill="#fff" stroke="#c8a84b" strokeWidth="0.7" />
        <text x="5" y="3" textAnchor="middle" fontSize="3" fill="#000" fontFamily="monospace">AP</text>
      </g>
      <g transform="translate(70 152)">
        <path d="M 0 0 L 12 -8 L 24 0 L 12 4 Z" fill="#22aa44" />
        <text x="12" y="0" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">$</text>
      </g>

      <path d="M 78 125 Q 100 138 122 125" stroke="#c8a84b" strokeWidth="3" fill="none" />
      <circle cx="100" cy="135" r="3" fill="#c8a84b" />

      <rect x="91" y="98" width="18" height="20" rx="3" fill="#7a543a" />
      <ellipse cx="100" cy="83" rx="28" ry="32" fill="#8a624a" />

      <path d="M 70 75 Q 75 48 100 48 Q 125 48 130 75 L 130 80 L 70 80 Z" fill="#1a0d05" />
      <path d="M 100 50 L 100 78" stroke="#22aa44" strokeWidth="2" />
      <text x="100" y="65" textAnchor="middle" fill="#22aa44" fontSize="8" fontFamily="monospace" fontWeight="bold">A</text>

      <ellipse cx="92" cy="88" rx="3" ry="2" fill="#222" />
      <ellipse cx="108" cy="88" rx="3" ry="2" fill="#222" />
      <path d="M 92 102 Q 100 106 108 102" stroke="#3a2010" strokeWidth="2" fill="none" />

      <text x="100" y="270" textAnchor="middle" fill="#22aa44" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        ATLANTA-STAN
      </text>
    </svg>
  );
}
