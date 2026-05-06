export default function EventBanner({ events = [] }) {
  return (
    <div className="bbg-card-base p-3 max-h-48 overflow-y-auto">
      <div className="font-display text-sm text-bbg-gold tracking-wider mb-2">EVENT LOG</div>
      {events.length === 0 && <div className="text-xs text-bbg-muted font-mono">No events yet.</div>}
      <ul className="space-y-1 text-xs font-mono">
        {events.slice(0, 10).map(e => (
          <li key={e.id} className="text-bbg-text">
            {summarize(e)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function summarize(e) {
  const d = e.data || {};
  switch (e.type) {
    case 'dice': return `🎲 Roll: ${d.roll}`;
    case 'claim': return `🚩 ${d.playerName} claimed ${d.tileKey}`;
    case 'develop': return `🏗️ developed → tier ${d.tier}`;
    case 'combat': return `⚔️ ${d.attackerWon ? 'TAKE' : 'FAIL'} (${d.atkRoll}v${d.defRoll})`;
    case 'card': return `🃏 ${d.playerName} → ${d.card?.name}`;
    case 'event': return `⚡ EVENT: ${d.card?.name}`;
    case 'eliminated': return `💀 ${d.playerName} eliminated`;
    case 'ability': return `⚡ ${d.ability}`;
    case 'trade_proposed': return `🤝 ${d.fromName} → ${d.toName}`;
    case 'trade': return `🤝 trade complete`;
    default: return e.type;
  }
}
