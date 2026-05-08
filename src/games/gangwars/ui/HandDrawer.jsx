import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';
import CardFront from '../graphics/cards/CardFront';

export default function HandDrawer() {
  const { privateState, gameState, mySocketId, initiateCard } = useBBG();
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(null);

  const hand = privateState?.myHand || [];
  const isMyTurn = gameState?.currentTurn === mySocketId;
  const myScore = gameState?.scores?.find(s => s.socketId === mySocketId);
  const myResources = myScore?.resources || privateState?.myResources || {};

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="bbg-card-base px-4 py-1.5 hover:scale-105 transition pointer-events-auto"
        style={{ borderColor: hand.length > 0 ? 'var(--bbg-gold)' : 'var(--bbg-border)' }}
      >
        <span className="font-display tracking-wider text-sm">
          🃏 HAND ({hand.length})
          {isMyTurn && <span className="ml-2 text-bbg-gold">▸ YOUR TURN</span>}
          <span className="ml-2 text-bbg-muted text-xs">{open ? '▾' : '▴'}</span>
        </span>
      </button>

      {open && hand.length > 0 && (
        <div
          className="bbg-card-base p-2 flex gap-2 overflow-x-auto pointer-events-auto"
          style={{ maxWidth: 'min(900px, 80vw)', maxHeight: '230px' }}
        >
          {hand.map(card => {
            const canAfford = Object.entries(card.cost || {}).every(
              ([r, v]) => (myResources[r] || 0) >= v
            );
            const isHovered = hovered === card.instanceId;
            return (
              <div
                key={card.instanceId}
                className="flex-shrink-0 flex flex-col items-center gap-1 transition-transform"
                style={{ transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'none' }}
                onMouseEnter={() => setHovered(card.instanceId)}
                onMouseLeave={() => setHovered(null)}
              >
                <CardFront card={card} width={120} height={168} />
                <button
                  className="btn btn-primary text-xs px-3 py-1 disabled:opacity-40"
                  disabled={!isMyTurn || !canAfford}
                  onClick={() => initiateCard(card)}
                  title={!canAfford
                    ? `Cost: ${Object.entries(card.cost).map(([r, v]) => `${v} ${r}`).join(', ')}`
                    : 'Play card'}
                >
                  {!canAfford ? '✗ COST' : 'PLAY'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && hand.length === 0 && (
        <div className="bbg-card-base p-3 text-xs font-mono text-bbg-muted pointer-events-auto">
          No cards. Roll → draw, or HUSTLE (100 Clout → +2 cards).
        </div>
      )}
    </div>
  );
}
