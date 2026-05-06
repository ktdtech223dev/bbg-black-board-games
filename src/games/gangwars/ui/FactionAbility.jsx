import { useBBG } from '../../../store/useBBG';

export default function FactionAbility({ faction, used, isMyTurn }) {
  const { useFactionAbility } = useBBG();
  if (!faction) return null;

  return (
    <div className="bbg-card-base p-3" style={{ borderColor: faction.color }}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-bbg-gold text-sm">{faction.active}</div>
        {used && <div className="text-xs text-bbg-muted font-mono">USED</div>}
      </div>
      <div className="text-xs text-bbg-muted mb-2">{faction.activeDesc}</div>
      <button
        className="btn btn-primary w-full text-sm"
        disabled={used || !isMyTurn}
        onClick={() => useFactionAbility({})}
      >
        ⚡ USE ABILITY
      </button>
    </div>
  );
}
