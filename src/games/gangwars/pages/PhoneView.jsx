import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';
import ResourceBar from '../ui/ResourceBar';
import CardHand from '../ui/CardHand';
import DiceFace from '../graphics/dice/DiceFace';
import TradeModal from '../ui/TradeModal';
import RadioWidget from '../ui/RadioWidget';
import { PORTRAITS } from '../graphics/portraits';

export default function PhoneView() {
  const {
    gameState, privateState, mySocketId, recentEvents,
    rollDice, claimTerritory, developTerritory, attackTile,
    endTurn, useFactionAbility, factionsList, fetchFactions,
  } = useBBG();
  const [tab, setTab] = useState('act');
  const [tradeOpen, setTradeOpen] = useState(false);

  const isMyTurn = gameState?.currentTurn === mySocketId;
  const phase = gameState?.currentPhase;
  const myFaction = privateState?.myFaction;
  const factionData = factionsList.find(f => f.id === myFaction);
  const Portrait = PORTRAITS[myFaction];
  const myScore = gameState?.scores?.find(s => s.socketId === mySocketId);
  const currentPlayer = gameState?.scores?.find(s => s.socketId === gameState?.currentTurn);

  if (!myFaction) fetchFactions();

  return (
    <div className="min-h-screen flex flex-col bg-bbg-void">
      <header className="bg-bbg-deep border-b border-bbg-border p-3 flex items-center gap-3">
        {Portrait && (
          <div className="w-12 h-16 overflow-hidden rounded">
            <Portrait size={48} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">{factionData?.name || 'NO FACTION'}</div>
          <div className="text-xs text-bbg-muted font-mono">R{gameState?.round || 1} · {phase?.toUpperCase() || '—'}</div>
        </div>
        {isMyTurn && <div className="bg-bbg-gold text-black text-xs font-mono px-2 py-1 rounded">YOUR TURN</div>}
      </header>

      <div className="bg-bbg-panel border-b border-bbg-border p-2">
        <ResourceBar resources={privateState?.myResources || {}} compact />
      </div>

      <nav className="flex bg-bbg-deep border-b border-bbg-border">
        {['hand', 'act', 'board', 'trade'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-display tracking-wider ${tab === t ? 'text-bbg-gold border-b-2 border-bbg-gold' : 'text-bbg-muted'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-3">
        {tab === 'hand' && (
          <CardHand hand={privateState?.myHand || []} compact isMyTurn={isMyTurn} />
        )}

        {tab === 'act' && (
          <div className="space-y-3">
            {!isMyTurn && (
              <div className="bbg-card-base p-4 text-center">
                <div className="text-xs text-bbg-muted font-mono">WAITING FOR</div>
                <div className="font-display text-2xl" style={{ color: currentPlayer?.color }}>
                  {currentPlayer?.name || '—'}
                </div>
              </div>
            )}

            {isMyTurn && phase === 'roll' && (
              <div className="bbg-card-base p-6 flex flex-col items-center gap-4">
                <div className="flex gap-3">
                  <DiceFace value={1} size={64} />
                  <DiceFace value={1} size={64} />
                </div>
                <button className="btn btn-primary text-2xl px-8 py-4" onClick={rollDice}>🎲 ROLL DICE</button>
              </div>
            )}

            {isMyTurn && phase === 'act' && (
              <>
                <ActionButton emoji="🚩" label="CLAIM TERRITORY" desc="Tap then pick an unclaimed tile (board tab)" />
                <ActionButton emoji="🏗️" label="DEVELOP" desc="Tap then pick your tile (board tab)" />
                <ActionButton emoji="⚔️" label="ATTACK" desc="Tap then pick enemy tile (board tab)" />
                <button className="btn w-full text-base py-3" onClick={() => useFactionAbility({})}>
                  ⚡ {factionData?.active || 'FACTION ABILITY'}
                </button>
                <button className="btn btn-danger w-full text-base py-3 mt-3" onClick={endTurn}>
                  🔚 END TURN
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'board' && (
          <div className="text-center text-sm text-bbg-muted">
            <div className="bbg-card-base p-4">
              Use the TV/host screen to view the full board.
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(privateState?.myTerritories || []).map(k => (
                  <div key={k} className="bg-bbg-raised p-2 rounded font-mono text-xs">{k}</div>
                ))}
              </div>
              {(privateState?.myTerritories || []).length === 0 && <div className="font-mono text-xs mt-3">No territories yet</div>}
            </div>
          </div>
        )}

        {tab === 'trade' && (
          <div>
            <button className="btn btn-primary w-full" onClick={() => setTradeOpen(true)}>
              🤝 PROPOSE TRADE
            </button>
            <div className="mt-3 text-xs text-bbg-muted text-center font-mono">Recent trade activity:</div>
            <div className="mt-2 space-y-1 text-xs font-mono">
              {recentEvents.filter(e => e.type === 'trade' || e.type === 'trade_proposed').slice(0, 5).map(e => (
                <div key={e.id} className="bg-bbg-raised p-2 rounded">
                  {e.data.fromName} → {e.data.toName}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <TradeModal open={tradeOpen} onClose={() => setTradeOpen(false)} />
      <RadioWidget position="bottom-right" />
    </div>
  );
}

function ActionButton({ emoji, label, desc }) {
  return (
    <div className="bbg-card-base p-3">
      <div className="font-display text-lg">{emoji} {label}</div>
      <div className="text-xs text-bbg-muted">{desc}</div>
    </div>
  );
}
