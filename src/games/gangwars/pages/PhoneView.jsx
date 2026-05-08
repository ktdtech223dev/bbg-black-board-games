import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';
import ResourceBar from '../ui/ResourceBar';
import CardHand from '../ui/CardHand';
import DiceFace from '../graphics/dice/DiceFace';
import TradeModal from '../ui/TradeModal';
import RadioWidget from '../ui/RadioWidget';
import CardTargetPicker from '../ui/CardTargetPicker';
import ActionConfirm from '../ui/ActionConfirm';
import ScoutResult from '../ui/ScoutResult';
import ScoutPicker from '../ui/ScoutPicker';
import TileInspector from '../ui/TileInspector';
import HexBoard from '../board/HexBoard';
import HowToPlay from '../../../hub/pages/HowToPlay';
import { PORTRAITS } from '../graphics/portraits';

export default function PhoneView() {
  const {
    gameState, privateState, mySocketId, recentEvents,
    rollDice, endTurn, useFactionAbility, factionsList, fetchFactions,
    pendingCard, currentAction, setCurrentAction, resolveCardTarget, pendActionForTile,
    productions, helpOpen, setHelpOpen, selectedTile, setSelectedTile,
    hustle, setPickingScoutTarget,
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
        <ResourceBar resources={myScore?.resources || privateState?.myResources || {}} compact />
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
                <ActBtn label="CLAIM TERRITORY" emoji="🚩" tone="#c8a84b"
                  active={currentAction === 'claim'}
                  onClick={() => { setCurrentAction(currentAction === 'claim' ? null : 'claim'); setTab('board'); }} />
                <ActBtn label="DEVELOP" emoji="🏗️" tone="#cc8822"
                  active={currentAction === 'develop'}
                  onClick={() => { setCurrentAction(currentAction === 'develop' ? null : 'develop'); setTab('board'); }} />
                <ActBtn label="ATTACK" emoji="⚔️" tone="#cc2222"
                  active={currentAction === 'attack'}
                  onClick={() => { setCurrentAction(currentAction === 'attack' ? null : 'attack'); setTab('board'); }} />
                <button className="btn w-full text-base py-3" onClick={() => useFactionAbility({})}>
                  ⚡ {factionData?.active || 'FACTION ABILITY'}
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button className="btn text-sm py-3" onClick={hustle} title="100 Clout · +2 cards">
                    💸 HUSTLE
                  </button>
                  <button className="btn text-sm py-3" onClick={() => setPickingScoutTarget(true)} title="75 Connect · spy hand">
                    🔭 SCOUT
                  </button>
                </div>
                <button className="btn btn-danger w-full text-base py-3 mt-3" onClick={endTurn}>
                  🔚 END TURN
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'board' && (
          <div className="space-y-2">
            {currentAction && (
              <div className="bbg-card-base p-2 text-center text-xs font-mono text-bbg-gold">
                {currentAction === 'claim' && '🚩 TAP AN UNCLAIMED TILE'}
                {currentAction === 'develop' && '🏗️ TAP YOUR OWNED TILE'}
                {currentAction === 'attack' && '⚔️ TAP AN ENEMY TILE'}
                {currentAction === 'card_target' && pendingCard && `🎯 TAP A TILE FOR ${pendingCard.card.name}`}
              </div>
            )}
            <div className="bbg-card-base p-1 overflow-hidden flex justify-center">
              {gameState?.board ? (
                <HexBoard
                  board={gameState.board}
                  players={gameState.scores}
                  selectedTile={selectedTile}
                  mySocketId={mySocketId}
                  productions={productions}
                  width={Math.min(window.innerWidth - 24, 380)}
                  height={Math.min(window.innerWidth - 24, 380)}
                  onTileClick={(t) => {
                    setSelectedTile(t);
                    if (!isMyTurn || phase !== 'act') return;
                    if (currentAction === 'card_target' && pendingCard) {
                      resolveCardTarget({ targetId: t.key });
                      return;
                    }
                    if (currentAction === 'claim' && !t.owner) pendActionForTile('claim', t);
                    else if (currentAction === 'develop' && t.owner === mySocketId && t.tier < 3) pendActionForTile('develop', t);
                    else if (currentAction === 'attack' && t.owner && t.owner !== mySocketId) pendActionForTile('attack', t);
                  }}
                />
              ) : <div className="text-bbg-muted text-sm py-8">Loading board…</div>}
            </div>
            <div className="text-[10px] font-mono text-bbg-muted text-center">
              Tap a tile · pinch/scroll to view
            </div>
            {selectedTile && gameState?.board?.tileMap?.[selectedTile] && (
              <TileInspector
                tile={gameState.board.tileMap[selectedTile]}
                scores={gameState?.scores || []}
              />
            )}
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
      <CardTargetPicker />
      <ActionConfirm />
      <ScoutPicker />
      <ScoutResult />
      <RadioWidget position="bottom-right" />

      <button
        onClick={() => setHelpOpen(true)}
        className="fixed top-3 right-3 z-30 bbg-card-base px-2 py-1.5 flex items-center gap-1"
        style={{ borderColor: 'var(--bbg-gold)' }}
        title="Game guide"
      >
        <span>📖</span>
        <span className="font-display text-[10px] tracking-wider">HELP</span>
      </button>
      {helpOpen && <HowToPlay onClose={() => setHelpOpen(false)} embedded />}
    </div>
  );
}

function ActBtn({ emoji, label, tone, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded transition flex items-center gap-3"
      style={{
        background: active ? `${tone}33` : 'var(--bbg-raised)',
        border: `1px solid ${active ? tone : 'var(--bbg-border)'}`,
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <div className="font-display text-base tracking-wider" style={{ color: active ? tone : 'var(--bbg-text)' }}>{label}</div>
        <div className="text-[10px] text-bbg-muted">{active ? 'Tap a tile on the board' : 'Tap to select this action'}</div>
      </div>
    </button>
  );
}
