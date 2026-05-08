import { CashIcon, MuscleIcon, CloutIcon, ConnectIcon } from '../graphics/resources';

const ROLL_ODDS = { 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:5, 9:4, 10:3, 11:2, 12:1 };
const TIER_NAMES = ['Unclaimed', 'Operation', 'Trap', 'Empire'];
const TIER_MULT = [0, 2, 3, 4];

const TYPE_RESOURCE = {
  trap: 'cash', corner: 'muscle', social: 'clout', underground: 'connect', wild: 'random',
};
const RES_COLORS = { cash:'#22cc55', muscle:'#cc2222', clout:'#cc88ff', connect:'#22aacc', random:'#cc8822' };
const RES_ICONS = { cash: CashIcon, muscle: MuscleIcon, clout: CloutIcon, connect: ConnectIcon };

export default function TileInspector({ tile, scores = [] }) {
  if (!tile) return null;

  const owner = tile.owner ? scores.find(s => s.socketId === tile.owner) : null;
  const tier = tile.tier || 0;
  const yieldNow = Math.floor(((tile.baseYield || 80) * (TIER_MULT[tier] || 0)) / 10);
  const isWildCenter = tile.q === 0 && tile.r === 0;
  const resource = TYPE_RESOURCE[tile.type] || 'cash';
  const Icon = RES_ICONS[resource];
  const color = RES_COLORS[resource];

  const odds = tile.token ? ROLL_ODDS[tile.token] : null;
  const oddsPct = odds != null ? Math.round((odds / 36) * 100) : null;

  const cumulative = (tile.cumulativeProduction || {})[tile.owner || ''] || 0;

  return (
    <div className="bbg-card-base p-3 text-xs space-y-2" style={{ borderColor: color + '88' }}>
      <div className="flex items-center justify-between">
        <div className="font-display text-bbg-gold tracking-wider text-base">
          TILE {tile.key}
          {isWildCenter && <span className="ml-2 text-bbg-gold2 text-[10px]">⭐ WILD CENTER</span>}
        </div>
      </div>

      {tile.neighborhood?.name && (
        <div className="text-bbg-text font-mono">{tile.neighborhood.name}</div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
        <Row k="Type" v={<span style={{ color }}>{tile.type.toUpperCase()}</span>} />
        <Row k="Resource" v={
          <span className="flex items-center gap-1">
            {Icon && <Icon size={14} />}
            <span style={{ color }}>{resource.toUpperCase()}</span>
          </span>
        } />
        <Row k="Token" v={tile.token ?? <span className="text-bbg-muted">—</span>} />
        <Row k="Tier" v={`${tier} · ${TIER_NAMES[tier]}`} />
        <Row k="Owner" v={owner ? <span style={{ color: owner.color }}>{owner.name}</span> : <span className="text-bbg-muted">— neutral —</span>} />
        {odds != null && (
          <Row k="Roll odds" v={
            <span>
              {odds}/36 <span className="text-bbg-muted">({oddsPct}%)</span>
            </span>
          } />
        )}
      </div>

      {tier > 0 && (
        <div className="border-t border-bbg-border pt-2">
          <div className="text-bbg-muted text-[10px] tracking-widest mb-1">PRODUCTION</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
            <Row k="Per roll" v={
              <span>
                <span style={{ color }}>+{yieldNow}</span> {resource}
              </span>
            } />
            {odds != null && (
              <Row k="Avg/roll" v={
                <span className="text-bbg-muted">
                  {((yieldNow * odds) / 36).toFixed(1)} {resource}
                </span>
              } />
            )}
            {tile.owner && (
              <Row k="Lifetime" v={
                <span style={{ color }}>
                  +{cumulative} {resource}
                </span>
              } span={2} />
            )}
          </div>
        </div>
      )}

      {isWildCenter && tile.owner && (
        <div className="bbg-card-base p-2 text-[11px] text-bbg-gold" style={{ background: 'rgba(200,168,75,0.08)' }}>
          ⭐ Wild bonus: +{5 + tier * 5} random resource on EVERY roll · bonus card every other roll
        </div>
      )}
    </div>
  );
}

function Row({ k, v, span = 1 }) {
  return (
    <>
      <span className="text-bbg-muted col-span-1">{k}</span>
      <span className={`col-span-${span === 2 ? '1' : '1'} text-right`}>{v}</span>
    </>
  );
}
