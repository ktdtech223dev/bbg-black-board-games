import { useBBG } from '../../../store/useBBG';
import CardFront from '../graphics/cards/CardFront';
import { CashIcon, MuscleIcon, CloutIcon, ConnectIcon } from '../graphics/resources';

const ICONS = { cash: CashIcon, muscle: MuscleIcon, clout: CloutIcon, connect: ConnectIcon };
const COLORS = { cash:'#22cc55', muscle:'#cc2222', clout:'#cc88ff', connect:'#22aacc' };

export default function ScoutResult() {
  const { scoutResult, closeScoutResult } = useBBG();
  if (!scoutResult) return null;

  const { targetName, hand = [], resources = {} } = scoutResult;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bbg-card-base bbg-glow-gold p-6 max-w-3xl w-full" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display text-3xl text-bbg-gold tracking-wider">🔭 SCOUT REPORT</div>
            <div className="text-xs font-mono text-bbg-muted">Spying on {targetName}</div>
          </div>
          <button className="btn" onClick={closeScoutResult}>✕ CLOSE</button>
        </div>

        <div className="text-xs font-mono text-bbg-muted mb-2">RESOURCES</div>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {['cash','muscle','clout','connect'].map(r => {
            const Icon = ICONS[r];
            return (
              <div key={r} className="bbg-card-base p-3 flex items-center gap-2">
                <Icon size={26} />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase" style={{ color: COLORS[r] }}>{r}</div>
                  <div className="font-display text-2xl" style={{ color: COLORS[r] }}>{resources[r] || 0}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs font-mono text-bbg-muted mb-2">HAND ({hand.length})</div>
        {hand.length === 0 ? (
          <div className="text-bbg-muted text-sm">Hand is empty.</div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {hand.map(c => (
              <div key={c.instanceId} className="flex-shrink-0">
                <CardFront card={c} width={140} height={196} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
