export default function AttackModal({ tile, onConfirm, onCancel }) {
  if (!tile) return null;
  const cost = 200 * (tile.tier || 1);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bbg-card-base p-6 max-w-md w-full bbg-glow-red">
        <div className="font-display text-3xl text-bbg-red mb-2">ATTACK</div>
        <div className="text-bbg-muted mb-4">Tile {tile.key} · Tier {tile.tier}</div>
        <div className="font-mono text-sm">Muscle Cost: <span className="text-bbg-red font-bold">{cost}</span></div>
        <div className="flex gap-2 mt-6">
          <button className="btn flex-1" onClick={onCancel}>CANCEL</button>
          <button className="btn btn-danger flex-1" onClick={onConfirm}>⚔️ STRIKE</button>
        </div>
      </div>
    </div>
  );
}
