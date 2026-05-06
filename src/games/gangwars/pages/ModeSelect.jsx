import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';
import LongGameWarning from '../ui/LongGameWarning';

export default function ModeSelect() {
  const { selectedMode, setSelectedMode, setPage, startGangWars, confirmLongGame, lobbyState, mySocketId } = useBBG();
  const [warnOpen, setWarnOpen] = useState(false);

  const modes = [
    { id: 'quick', label: 'QUICK', time: '15-25 MIN', threshold: '1,000 wealth', max: 4, color: '#22aa44',
      features: ['Full faction abilities', 'Card deck', '✗ Seasonal bonuses', '✗ Neighborhood bonuses']
    },
    { id: 'medium', label: 'MEDIUM', time: '26-45 MIN', threshold: '2,000 wealth', max: 6, color: '#c8a84b',
      features: ['All features active', 'Full board', 'Seasonal bonuses', 'Neighborhood bonuses']
    },
    { id: 'long', label: 'LONG', time: '45 MIN - 1 HR+', threshold: 'ELIMINATION ONLY', max: 8, color: '#cc2222',
      features: ['All features active', 'Alliance system', 'Extra dev tier', '⚠️ NO SAVES — must finish']
    },
  ];

  function pickMode(m) {
    setSelectedMode(m.id);
    if (m.id === 'long') setWarnOpen(true);
  }

  function handleConfirm(start) {
    confirmLongGame();
    if (start === true) {
      setWarnOpen(false);
      startGangWars();
      setPage('gw_faction');
    }
  }

  function handleStart() {
    if (selectedMode === 'long') {
      setWarnOpen(true);
      return;
    }
    startGangWars();
    setPage('gw_faction');
  }

  return (
    <div className="min-h-screen p-6 grain">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">PICK YOUR MODE</div>
          <div className="text-bbg-muted text-sm">How long are you in for?</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage('gw_map')}>← MAP</button>
          {selectedMode && <button className="btn btn-primary" onClick={handleStart}>START GAME ▶</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => pickMode(m)}
            className="bbg-card-base p-6 text-left hover:scale-[1.03] transition-all"
            style={{
              borderColor: selectedMode === m.id ? m.color : 'var(--bbg-border)',
              boxShadow: selectedMode === m.id ? `0 0 32px ${m.color}66` : 'none',
            }}
          >
            <div className="font-display text-4xl tracking-wider" style={{ color: m.color }}>{m.label}</div>
            <div className="text-bbg-muted font-mono text-xs mt-1">{m.time}</div>
            <div className="text-sm mt-4">Win: <span className="font-bold">{m.threshold}</span></div>
            <div className="text-xs text-bbg-muted">Max {m.max} players</div>

            <ul className="mt-4 space-y-1 text-xs">
              {m.features.map(f => (
                <li key={f} className={f.startsWith('✗') ? 'text-bbg-muted' : f.startsWith('⚠') ? 'text-bbg-red' : 'text-bbg-text'}>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <LongGameWarning open={warnOpen} onClose={() => setWarnOpen(false)} onConfirm={handleConfirm} />
    </div>
  );
}
