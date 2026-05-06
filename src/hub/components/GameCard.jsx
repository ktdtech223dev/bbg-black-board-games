import { useBBG } from '../../store/useBBG';

const ACCENT = {
  gangwars: { glow: '#cc2222', border: '#cc4444', name: 'GANG WARS' },
  generational_wealth: { glow: '#22aa44', border: '#226633', name: 'GENERATIONAL WEALTH' },
  cap_detector: { glow: '#cc88ff', border: '#7755aa', name: 'CAP DETECTOR' },
};

function GangWarsArt() {
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <linearGradient id="gw-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#1a0505" />
          <stop offset="100%" stopColor="#050000" />
        </linearGradient>
        <radialGradient id="gw-spot" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#cc2222" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#gw-bg)" />
      <rect width="320" height="180" fill="url(#gw-spot)" />
      {[0,1,2,3,4,5].map(i => (
        <polygon
          key={i}
          points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
          transform={`translate(${50 + i * 40},${90 + (i%2)*22}) scale(0.9)`}
          fill={['#cc2222','#2255cc','#ccaa00','#22aa44','#cc6600','#8822cc'][i]}
          opacity="0.65"
          stroke="#fff"
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />
      ))}
      <text x="160" y="32" textAnchor="middle" fill="#e8e4d8" fontFamily="Bebas Neue" fontSize="22" letterSpacing="3">GANG WARS</text>
      <text x="160" y="50" textAnchor="middle" fill="#c8a84b" fontFamily="Rajdhani" fontSize="10" letterSpacing="2">TERRITORY · STRATEGY · POWER</text>
    </svg>
  );
}

export default function GameCard({ game }) {
  const setPage = useBBG(s => s.setPage);
  const accent = ACCENT[game.id] || ACCENT.gangwars;
  const isLive = game.status === 'live';

  return (
    <div
      className={`bbg-card-base relative overflow-hidden flex flex-col h-[340px] transition-all duration-300 ${isLive ? 'hover:scale-[1.02]' : 'opacity-60'}`}
      style={{
        borderColor: isLive ? accent.border : 'var(--bbg-border)',
        boxShadow: isLive ? `0 0 32px ${accent.glow}33, inset 0 0 16px ${accent.glow}11` : 'none',
      }}
    >
      <div className="h-44 bg-bbg-deep border-b border-bbg-border relative overflow-hidden">
        {game.id === 'gangwars' ? (
          <GangWarsArt />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center grain">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke={accent.glow} strokeWidth="2" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke={accent.glow} strokeWidth="2" />
            </svg>
            <div className="font-mono text-xs text-bbg-muted mt-2">LOCKED</div>
          </div>
        )}
        {isLive && <div className="absolute top-2 right-2 bg-bbg-green text-white text-xs font-mono px-2 py-1 rounded">LIVE</div>}
        {!isLive && (
          <>
            <div className="absolute inset-0 shimmer" />
            <div className="absolute top-2 right-2 bg-bbg-raised text-bbg-muted text-xs font-mono px-2 py-1 rounded border border-bbg-border">COMING SOON</div>
          </>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-display text-2xl tracking-wider" style={{ color: isLive ? '#fff' : 'var(--bbg-muted)' }}>
          {game.name}
        </h3>
        <div className="text-bbg-muted text-sm mt-1">{game.subtitle || ''}</div>
        {game.players && <div className="text-bbg-gold text-xs font-mono mt-2">{game.players} PLAYERS</div>}

        <div className="mt-auto">
          {isLive ? (
            <button
              className="btn btn-primary w-full"
              onClick={() => setPage('gw_lobby_choice')}
            >
              ▶ PLAY
            </button>
          ) : (
            <button className="btn btn-disabled w-full">🔒 LOCKED</button>
          )}
        </div>
      </div>
    </div>
  );
}
