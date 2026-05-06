import { useState, useMemo } from 'react';
import { useBBG } from '../../../store/useBBG';
import HexBoard from '../board/HexBoard';
import TurnOrder from '../ui/TurnOrder';
import EventBanner from '../ui/EventBanner';
import DiceRoller from '../ui/DiceRoller';
import ResourceBar from '../ui/ResourceBar';
import AttackModal from '../ui/AttackModal';

export default function GameBoard() {
  const {
    gameState, privateState, mySocketId, recentEvents,
    selectedTile, setSelectedTile, currentAction, setCurrentAction,
    diceResult, rollDice, claimTerritory, developTerritory, attackTile, endTurn,
  } = useBBG();

  const [attackTarget, setAttackTarget] = useState(null);

  const board = gameState?.board;
  const scores = gameState?.scores || [];
  const isMyTurn = gameState?.currentTurn === mySocketId;
  const phase = gameState?.currentPhase;
  const myScore = scores.find(s => s.socketId === mySocketId);
  const currentPlayer = scores.find(s => s.socketId === gameState?.currentTurn);
  const tile = selectedTile && board?.tileMap?.[selectedTile];
  const myResources = privateState?.myResources || {};

  const handleTileClick = (t) => {
    setSelectedTile(t);
    if (!isMyTurn || phase !== 'act') return;
    if (currentAction === 'claim' && !t.owner) claimTerritory(t.key);
    else if (currentAction === 'develop' && t.owner === mySocketId) developTerritory(t.key);
    else if (currentAction === 'attack' && t.owner && t.owner !== mySocketId) setAttackTarget(t);
  };

  return (
    <div className="min-h-screen flex bg-bbg-void">
      <aside className="w-80 border-r border-bbg-border bg-bbg-deep flex flex-col">
        <div className="p-4 border-b border-bbg-border">
          <div className="font-display text-2xl text-bbg-gold tracking-wider">ROUND {gameState?.round || 1}</div>
          <div className="text-xs text-bbg-muted font-mono">{gameState?.board?.mapId}</div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs text-bbg-muted font-mono mb-2">TURN ORDER</div>
          <TurnOrder scores={scores} currentTurn={gameState?.currentTurn} />
        </div>
        <div className="p-3 border-t border-bbg-border">
          <EventBanner events={recentEvents} />
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center relative">
        {board ? (
          <HexBoard
            board={board}
            players={scores}
            currentPlayer={gameState?.currentTurn}
            selectedTile={selectedTile}
            onTileClick={handleTileClick}
            mySocketId={mySocketId}
            width={Math.min(960, window.innerWidth - 640)}
            height={Math.max(600, window.innerHeight - 80)}
          />
        ) : (
          <div className="font-display text-3xl text-bbg-muted">LOADING BOARD...</div>
        )}
      </main>

      <aside className="w-72 border-l border-bbg-border bg-bbg-deep p-4 flex flex-col gap-4 overflow-y-auto">
        {currentPlayer && (
          <div className="bbg-card-base p-3" style={{ borderColor: currentPlayer.color }}>
            <div className="text-xs font-mono text-bbg-muted">CURRENT TURN</div>
            <div className="font-display text-xl" style={{ color: currentPlayer.color }}>{currentPlayer.name}</div>
            <div className="text-xs text-bbg-muted">{currentPlayer.faction}</div>
            <div className="text-xs text-bbg-gold font-mono mt-1">PHASE: {phase?.toUpperCase() || '—'}</div>
          </div>
        )}

        <div className="bbg-card-base p-3 flex flex-col items-center">
          <DiceRoller
            d1={diceResult?.d1}
            d2={diceResult?.d2}
            isMyTurn={isMyTurn}
            phase={phase}
            onRoll={rollDice}
          />
        </div>

        {myScore && (
          <div className="bbg-card-base p-3">
            <div className="text-xs font-mono text-bbg-muted mb-2">MY RESOURCES</div>
            <ResourceBar resources={myResources} compact />
          </div>
        )}

        {isMyTurn && phase === 'act' && (
          <div className="bbg-card-base p-3 space-y-2">
            <div className="text-xs font-mono text-bbg-muted">ACTIONS</div>
            <button className={`btn w-full ${currentAction==='claim'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='claim'?null:'claim')}>🚩 CLAIM</button>
            <button className={`btn w-full ${currentAction==='develop'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='develop'?null:'develop')}>🏗️ DEVELOP</button>
            <button className={`btn w-full ${currentAction==='attack'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='attack'?null:'attack')}>⚔️ ATTACK</button>
            <button className="btn btn-danger w-full mt-2" onClick={endTurn}>🔚 END TURN</button>
          </div>
        )}

        {!isMyTurn && (
          <div className="bbg-card-base p-3 text-center text-sm">
            <span className="text-bbg-muted">Waiting on </span>
            <span className="text-bbg-gold font-bold">{currentPlayer?.name || '—'}</span>
          </div>
        )}

        {tile && (
          <div className="bbg-card-base p-3 text-xs space-y-1">
            <div className="font-display text-bbg-gold">TILE {tile.key}</div>
            <div>Type: <span className="text-bbg-text uppercase font-mono">{tile.type}</span></div>
            <div>Token: <span className="font-mono">{tile.token || '—'}</span></div>
            <div>Tier: <span className="font-mono">{tile.tier || 0}</span></div>
            <div>Owner: <span className="font-mono">{scores.find(s => s.socketId === tile.owner)?.name || '— neutral —'}</span></div>
            {tile.neighborhood && <div className="text-bbg-muted">{tile.neighborhood.name}</div>}
          </div>
        )}
      </aside>

      {attackTarget && (
        <AttackModal
          tile={attackTarget}
          onCancel={() => setAttackTarget(null)}
          onConfirm={() => { attackTile(attackTarget.key); setAttackTarget(null); }}
        />
      )}
    </div>
  );
}
