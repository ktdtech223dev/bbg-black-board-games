import { useEffect } from 'react';
import { useBBG } from '../../../store/useBBG';
import { PORTRAITS } from '../graphics/portraits';

export default function FactionSelect() {
  const { factionsList, fetchFactions, gameState, selectFaction, selectedFaction, setPage, mySocketId } = useBBG();

  useEffect(() => { fetchFactions(); }, [fetchFactions]);

  const taken = new Set((gameState?.scores || []).map(s => s.faction).filter(Boolean));
  const myFaction = gameState?.scores?.find(s => s.socketId === mySocketId)?.faction;

  function difficultyDots(d) {
    const map = { Easy: 1, Medium: 2, Hard: 3 };
    return '●'.repeat(map[d] || 1) + '○'.repeat(3 - (map[d] || 1));
  }

  return (
    <div className="min-h-screen p-6 grain">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">CHOOSE YOUR CREW</div>
          <div className="text-bbg-muted text-sm">Pick a faction · One per player</div>
        </div>
        <div className="flex gap-2">
          {myFaction && <button className="btn btn-primary" onClick={() => setPage('gw_board')}>READY ▶</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {factionsList.map(f => {
          const Portrait = PORTRAITS[f.id];
          const isTaken = taken.has(f.id) && myFaction !== f.id;
          const isMine = myFaction === f.id;
          return (
            <div
              key={f.id}
              className={`bbg-card-base overflow-hidden flex flex-col ${isTaken ? 'opacity-40' : ''}`}
              style={{
                borderColor: isMine ? f.color : 'var(--bbg-border)',
                boxShadow: isMine ? `0 0 30px ${f.color}66` : 'none',
              }}
            >
              <div className="bg-bbg-deep flex justify-center" style={{ background: `linear-gradient(180deg, ${f.color}11, transparent)` }}>
                {Portrait && <Portrait size={160} />}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="font-display text-xl tracking-wider" style={{ color: f.color }}>{f.name}</div>
                <div className="text-xs text-bbg-muted font-mono">{f.city}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${f.color}33`, color: f.color }}>
                    {f.playstyle}
                  </span>
                  <span className="text-[10px] font-mono text-bbg-muted">{difficultyDots(f.difficulty)}</span>
                </div>
                <div className="text-xs text-bbg-text italic mt-2">"{f.motto}"</div>

                <div className="mt-3 text-xs space-y-1">
                  <div><span className="text-bbg-gold font-bold">PASSIVE:</span> <span className="text-bbg-muted">{f.passive}</span></div>
                  <div className="text-[10px] text-bbg-muted">{f.passiveDesc}</div>
                  <div className="mt-2"><span className="text-bbg-gold font-bold">ACTIVE:</span> <span className="text-bbg-muted">{f.active}</span></div>
                  <div className="text-[10px] text-bbg-muted">{f.activeDesc}</div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-mono">
                  <Resource label="$" value={f.starting?.cash} color="#22cc55" />
                  <Resource label="MUS" value={f.starting?.muscle} color="#cc2222" />
                  <Resource label="CLT" value={f.starting?.clout} color="#cc88ff" />
                  <Resource label="CON" value={f.starting?.connect} color="#22aacc" />
                </div>

                <button
                  className={`btn mt-3 ${isMine ? 'btn-primary' : ''}`}
                  disabled={isTaken && !isMine}
                  onClick={() => !isMine && selectFaction(f.id)}
                >
                  {isMine ? '✓ SELECTED' : isTaken ? 'TAKEN' : 'SELECT'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Resource({ label, value, color }) {
  return (
    <div className="bg-bbg-raised rounded p-1 text-center">
      <div style={{ color }}>{label}</div>
      <div className="text-bbg-text">{value}</div>
    </div>
  );
}
