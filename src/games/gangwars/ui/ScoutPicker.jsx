import { useBBG } from '../../../store/useBBG';

export default function ScoutPicker() {
  const { pickingScoutTarget, setPickingScoutTarget, scout, gameState, mySocketId } = useBBG();
  if (!pickingScoutTarget) return null;

  const others = (gameState?.scores || []).filter(s => s.socketId !== mySocketId && !s.isEliminated);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bbg-card-base bbg-glow-gold p-5 max-w-md w-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display text-2xl text-bbg-gold tracking-wider">🔭 SCOUT</div>
            <div className="text-xs font-mono text-bbg-muted">Pay 75 Connect to peek at any player</div>
          </div>
          <button className="btn" onClick={() => setPickingScoutTarget(false)}>✕</button>
        </div>
        <div className="space-y-2">
          {others.length === 0 && <div className="text-bbg-muted text-sm">No targets.</div>}
          {others.map(p => (
            <button
              key={p.socketId}
              onClick={() => { scout(p.socketId); setPickingScoutTarget(false); }}
              className="w-full text-left p-3 rounded transition flex items-center gap-3 bg-bbg-raised hover:bg-bbg-hover"
              style={{ border: `1px solid ${p.color}55` }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <span className="font-display flex-1">{p.name}</span>
              <span className="text-xs text-bbg-muted font-mono uppercase">{p.faction || '—'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
