import { useBBG } from '../../../store/useBBG';
import { CashIcon, MuscleIcon, CloutIcon, ConnectIcon } from '../graphics/resources';

const ICONS = { cash: CashIcon, muscle: MuscleIcon, clout: CloutIcon, connect: ConnectIcon };
const COLORS = {
  cash: '#22cc55', muscle: '#cc2222', clout: '#cc88ff', connect: '#22aacc',
};
const ACCENTS = {
  claim:   { color: '#c8a84b', icon: '🚩', verb: 'CLAIM',   tone: 'gold' },
  develop: { color: '#cc8822', icon: '🏗️', verb: 'DEVELOP', tone: 'gold' },
  attack:  { color: '#cc2222', icon: '⚔️', verb: 'ATTACK',  tone: 'red' },
};

export default function ActionConfirm() {
  const { pendingAction, cancelPendingAction, confirmPendingAction, privateState, gameState, mySocketId } = useBBG();
  if (!pendingAction) return null;

  const { kind, tile, cost } = pendingAction;
  const accent = ACCENTS[kind];
  const myRes = privateState?.myResources || {};
  const canAfford = Object.entries(cost).every(([r, v]) => (myRes[r] || 0) >= v);

  const tier = tile.tier || 0;
  const tierName = ['Unclaimed','Operation','Trap','Empire'][tier] || 'Unclaimed';
  const nextTier = kind === 'develop' ? Math.min(3, tier + 1) : tier;
  const nextTierName = ['Unclaimed','Operation','Trap','Empire'][nextTier];

  const owner = (gameState?.scores || []).find(s => s.socketId === tile.owner);
  const yieldNow = baseYieldFor(tile, tier);
  const yieldNext = kind === 'develop' ? baseYieldFor(tile, nextTier) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div
        className="bbg-card-base p-6 max-w-md w-full"
        style={{
          borderColor: accent.color,
          boxShadow: `0 0 36px ${accent.color}66, inset 0 0 14px ${accent.color}11`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">{accent.icon}</div>
          <div>
            <div className="font-display text-3xl tracking-wider" style={{ color: accent.color }}>
              {accent.verb}
            </div>
            <div className="text-xs text-bbg-muted font-mono">
              TILE {tile.key} · {(tile.type || '').toUpperCase()}
              {tile.token && ` · ${tile.token}`}
            </div>
          </div>
        </div>

        {/* Tile snapshot */}
        <div className="bg-bbg-raised rounded p-3 mb-3 text-sm space-y-1">
          {tile.neighborhood?.name && (
            <div className="text-bbg-gold font-display tracking-wider">{tile.neighborhood.name}</div>
          )}
          <div className="flex justify-between"><span className="text-bbg-muted">Current</span><span>{tierName}</span></div>
          {kind === 'develop' && (
            <div className="flex justify-between"><span className="text-bbg-muted">Becomes</span><span className="text-bbg-gold">{nextTierName}</span></div>
          )}
          {owner && (
            <div className="flex justify-between"><span className="text-bbg-muted">Owner</span>
              <span style={{ color: owner.color }}>{owner.name}</span></div>
          )}
          {yieldNow > 0 && (
            <div className="flex justify-between"><span className="text-bbg-muted">Yield/roll</span>
              <span>{yieldNow}{yieldNext ? ` → ${yieldNext}` : ''}</span></div>
          )}
        </div>

        {/* Cost */}
        <div className="bbg-card-base p-3 mb-3" style={{ borderColor: 'var(--bbg-border)' }}>
          <div className="text-xs font-mono text-bbg-muted mb-2">COST</div>
          {Object.entries(cost).map(([r, v]) => {
            const Icon = ICONS[r];
            const have = myRes[r] || 0;
            const ok = have >= v;
            return (
              <div key={r} className="flex items-center gap-2 py-1">
                {Icon && <Icon size={20} />}
                <span className="font-mono text-sm uppercase flex-1" style={{ color: COLORS[r] }}>{r}</span>
                <span className={`font-mono text-sm ${ok ? 'text-bbg-text' : 'text-bbg-red'}`}>
                  {v} <span className="text-bbg-muted">/ {have}</span>
                </span>
                {!ok && <span className="text-xs text-bbg-red">SHORT {v - have}</span>}
              </div>
            );
          })}
        </div>

        {kind === 'attack' && (
          <div className="text-xs text-bbg-muted mb-3 px-1">
            Combat is dice-based. If you lose, you forfeit an additional 50% Muscle.
          </div>
        )}

        <div className="flex gap-2">
          <button className="btn flex-1" onClick={cancelPendingAction}>CANCEL</button>
          <button
            className={`btn flex-1 ${kind === 'attack' ? 'btn-danger' : 'btn-primary'} disabled:opacity-40`}
            disabled={!canAfford}
            onClick={confirmPendingAction}
          >
            {accent.icon} {canAfford ? `CONFIRM ${accent.verb}` : 'NOT ENOUGH'}
          </button>
        </div>
      </div>
    </div>
  );
}

function baseYieldFor(tile, tier) {
  if (!tile || !tile.baseYield || !tier) return 0;
  const mult = [0,2,3,4][tier] || 0;
  return Math.floor((tile.baseYield * mult) / 10);
}
