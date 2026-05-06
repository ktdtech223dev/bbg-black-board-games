export default function TurnOrder({ scores = [], currentTurn }) {
  return (
    <div className="space-y-2">
      {scores.map(s => {
        const isCurrent = s.socketId === currentTurn;
        return (
          <div
            key={s.socketId}
            className={`p-3 rounded border transition ${
              isCurrent ? 'border-bbg-gold bg-bbg-raised' : 'border-bbg-border bg-bbg-card'
            } ${s.isEliminated ? 'opacity-40 line-through' : ''}`}
            style={isCurrent ? { boxShadow: `0 0 16px ${s.color}66` } : {}}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="font-display flex-1 truncate">{s.name}</span>
              {isCurrent && <span className="text-bbg-gold text-xs font-mono">▶</span>}
            </div>
            <div className="grid grid-cols-2 text-xs text-bbg-muted font-mono mt-1">
              <span>{s.faction || '—'}</span>
              <span className="text-right">${s.totalWealth || 0}</span>
            </div>
            <div className="text-xs text-bbg-muted font-mono">
              {s.territories} territories
            </div>
          </div>
        );
      })}
    </div>
  );
}
