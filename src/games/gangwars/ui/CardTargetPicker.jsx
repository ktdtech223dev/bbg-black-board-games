import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';

const RESOURCES = ['cash', 'muscle', 'clout', 'connect'];

export default function CardTargetPicker() {
  const { pendingCard, gameState, mySocketId, resolveCardTarget, cancelCard } = useBBG();
  const [pickedPlayer, setPickedPlayer] = useState(null);
  const [pickedRes, setPickedRes] = useState('cash');

  if (!pendingCard) return null;
  const { card, mode } = pendingCard;
  const others = (gameState?.scores || []).filter(s => s.socketId !== mySocketId && !s.isEliminated);

  // Tile-pick mode shows a thin banner; the user clicks the actual tile on the board
  if (mode === 'pick_tile') {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bbg-card-base px-4 py-3 bbg-glow-gold flex items-center gap-3 max-w-2xl">
        <span className="text-2xl">🎯</span>
        <div>
          <div className="font-display text-bbg-gold text-sm tracking-wider">PLAYING · {card.name.toUpperCase()}</div>
          <div className="text-xs text-bbg-muted">Tap a {tileFilterLabel(card.target)} on the board</div>
        </div>
        <button className="btn ml-2" onClick={cancelCard}>CANCEL</button>
      </div>
    );
  }

  // Player picker (and player+resource)
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bbg-card-base bbg-glow-gold p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-2xl text-bbg-gold tracking-wider">{card.name.toUpperCase()}</div>
          <button className="btn" onClick={cancelCard}>✕</button>
        </div>
        <div className="text-sm text-bbg-muted mb-4">{card.desc}</div>

        <div className="text-xs text-bbg-muted font-mono mb-2">PICK A PLAYER</div>
        <div className="space-y-2 mb-4">
          {others.length === 0 && <div className="text-bbg-muted text-sm">No valid targets.</div>}
          {others.map(p => (
            <button
              key={p.socketId}
              onClick={() => setPickedPlayer(p.socketId)}
              className={`w-full text-left p-3 rounded transition flex items-center gap-3 ${
                pickedPlayer === p.socketId ? 'bbg-glow-gold' : 'bg-bbg-raised hover:bg-bbg-hover'
              }`}
              style={{ border: `1px solid ${pickedPlayer === p.socketId ? '#c8a84b' : 'var(--bbg-border)'}` }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <span className="font-display flex-1">{p.name}</span>
              <span className="text-xs text-bbg-muted font-mono uppercase">{p.faction || '—'}</span>
            </button>
          ))}
        </div>

        {mode === 'pick_player_resource' && (
          <>
            <div className="text-xs text-bbg-muted font-mono mb-2">DEMAND WHICH RESOURCE</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {RESOURCES.map(r => (
                <button
                  key={r}
                  onClick={() => setPickedRes(r)}
                  className={`px-3 py-2 rounded text-xs font-mono uppercase ${
                    pickedRes === r ? 'bg-bbg-gold text-black' : 'bg-bbg-raised'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          className="btn btn-primary w-full"
          disabled={!pickedPlayer}
          onClick={() => resolveCardTarget({ targetId: pickedPlayer, ...(mode === 'pick_player_resource' ? { param1: pickedRes } : {}) })}
        >
          ▶ PLAY CARD
        </button>
      </div>
    </div>
  );
}

function tileFilterLabel(target) {
  switch (target) {
    case 'tile_enemy':    return 'enemy-owned tile';
    case 'tile_enemy_t1': return 'tier-1 enemy tile';
    case 'tile_any':      return 'tile';
    default:              return 'tile';
  }
}
