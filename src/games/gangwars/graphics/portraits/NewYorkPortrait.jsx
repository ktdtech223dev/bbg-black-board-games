export default function NewYorkPortrait({ size = 200 }) {
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ny-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#ccaa00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#050505" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill="#050505" />
      <rect width="200" height="280" fill="url(#ny-glow)" />

      {[20,40,60,150,170,30,160,55,145].map((x,i)=>(
        <circle key={i} cx={x} cy={40+(i*22)%180} r={1.5+i%3} fill="#ccaa00" opacity="0.18" />
      ))}
      <ellipse cx="100" cy="265" rx="48" ry="7" fill="rgba(204,170,0,0.25)" />

      <rect x="78" y="195" width="18" height="65" rx="5" fill="#1a1408" />
      <rect x="104" y="195" width="18" height="65" rx="5" fill="#1a1408" />
      <rect x="72" y="248" width="28" height="12" rx="3" fill="#222" />
      <rect x="100" y="248" width="28" height="12" rx="3" fill="#222" />
      <rect x="72" y="248" width="28" height="3" fill="#ccaa00" />
      <rect x="100" y="248" width="28" height="3" fill="#ccaa00" />

      <path d="M 65 125 L 62 200 L 138 200 L 135 125 L 122 113 L 78 113 Z" fill="#0a0d18" />
      <path d="M 62 130 L 138 130 L 135 145 L 65 145 Z" fill="#070a14" />

      <rect x="91" y="98" width="18" height="20" rx="3" fill="#5a4a30" />
      <ellipse cx="103" cy="80" rx="26" ry="32" fill="#6a5638" transform="rotate(-12 103 80)" />

      <path d="M 78 75 Q 78 48 105 48 Q 130 48 130 75 L 130 80 L 78 80 Z" fill="#0a0d18" transform="rotate(-12 100 65)" />
      <rect x="76" y="78" width="56" height="5" fill="#070a14" transform="rotate(-12 100 80)" />
      <rect x="95" y="64" width="18" height="10" rx="1" fill="#ccaa00" transform="rotate(-12 104 70)" />
      <text x="104" y="72" textAnchor="middle" fill="#0a0a0a" fontSize="9" fontFamily="monospace" fontWeight="bold" transform="rotate(-12 104 70)">NY</text>

      <ellipse cx="96" cy="86" rx="3" ry="2" fill="#ccaa00" />
      <ellipse cx="111" cy="86" rx="3" ry="2" fill="#ccaa00" />
      <ellipse cx="96" cy="86" rx="1.5" ry="1" fill="#222" />
      <ellipse cx="111" cy="86" rx="1.5" ry="1" fill="#222" />
      <line x1="103" y1="92" x2="106" y2="92" stroke="#3a2410" strokeWidth="1.5" />

      <ellipse cx="124" cy="88" rx="4" ry="6" fill="#1a1408" />
      <path d="M 124 90 Q 130 88 132 92" stroke="#444" strokeWidth="1.5" fill="none" />

      <text x="100" y="270" textAnchor="middle" fill="#ccaa00" fontSize="9" fontFamily="monospace" letterSpacing="2" fontWeight="bold">
        NEW YORK
      </text>
    </svg>
  );
}
