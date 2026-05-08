import { useState, useMemo } from 'react';
import { useBBG } from '../../../store/useBBG';
import HexBoard from '../board/HexBoard';
import TurnOrder from '../ui/TurnOrder';
import EventBanner from '../ui/EventBanner';
import DiceRoller from '../ui/DiceRoller';
import ResourceBar from '../ui/ResourceBar';
import RadioWidget from '../ui/RadioWidget';
import CardTargetPicker from '../ui/CardTargetPicker';
import ActionConfirm from '../ui/ActionConfirm';
import ScoutResult from '../ui/ScoutResult';
import ScoutPicker from '../ui/ScoutPicker';
import TileInspector from '../ui/TileInspector';
import HowToPlay from '../../../hub/pages/HowToPlay';

export default function GameBoard() {
  const {
    gameState, privateState, mySocketId, recentEvents,
    selectedTile, setSelectedTile, currentAction, setCurrentAction,
    diceResult, rollDice, endTurn, hustle, setPickingScoutTarget,
    pendingCard, resolveCardTarget, pendActionForTile,
    productions, helpOpen, setHelpOpen,
  } = useBBG();

  const board = gameState?.board;
  const scores = gameState?.scores || [];
  const isMyTurn = gameState?.currentTurn === mySocketId;
  const phase = gameState?.currentPhase;
  const myScore = scores.find(s => s.socketId === mySocketId);
  const currentPlayer = scores.find(s => s.socketId === gameState?.currentTurn);
  const tile = selectedTile && board?.tileMap?.[selectedTile];
  // SINGLE SOURCE OF TRUTH: derive my resources from the public scores
  // array. This array is updated atomically with mergeScores on every
  // event that carries scores (dice_rolled, turn_ended, etc.) so the
  // values can never disagree between displays.
  const myResources = myScore?.resources || privateState?.myResources || {};

  const handleTileClick = (t) => {
    setSelectedTile(t);
    if (!isMyTurn || phase !== 'act') return;

    // Card targeting mode — validates filter then plays
    if (currentAction === 'card_target' && pendingCard) {
      const filter = pendingCard.card.target;
      if (!isValidCardTile(t, filter, mySocketId)) return;
      resolveCardTarget({ targetId: t.key });
      return;
    }

    // All three actions now go through the confirmation modal
    if (currentAction === 'claim' && !t.owner) pendActionForTile('claim', t);
    else if (currentAction === 'develop' && t.owner === mySocketId && t.tier < 3) pendActionForTile('develop', t);
    else if (currentAction === 'attack' && t.owner && t.owner !== mySocketId) pendActionForTile('attack', t);
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
            productions={productions}
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
            <div className="text-xs font-mono text-bbg-muted">CORE ACTIONS</div>
            <button className={`btn w-full ${currentAction==='claim'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='claim'?null:'claim')}>🚩 CLAIM <span className="text-xs text-bbg-muted">100 $</span></button>
            <button className={`btn w-full ${currentAction==='develop'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='develop'?null:'develop')}>🏗️ DEVELOP <span className="text-xs text-bbg-muted">300/600 $</span></button>
            <button className={`btn w-full ${currentAction==='attack'?'btn-primary':''}`} onClick={() => setCurrentAction(currentAction==='attack'?null:'attack')}>⚔️ ATTACK <span className="text-xs text-bbg-muted">200 M/tier</span></button>
            <div className="text-xs font-mono text-bbg-muted pt-2 border-t border-bbg-border">SOFT POWER</div>
            <button className="btn w-full" onClick={hustle} title="Spend Clout to draw cards">💸 HUSTLE <span className="text-xs text-bbg-muted">100 C → +2 cards</span></button>
            <button className="btn w-full" onClick={() => setPickingScoutTarget(true)} title="Spend Connect to peek at any player">🔭 SCOUT <span className="text-xs text-bbg-muted">75 K → spy hand</span></button>
            <button className="btn btn-danger w-full mt-2" onClick={endTurn}>🔚 END TURN</button>
          </div>
        )}

        {!isMyTurn && (
          <div className="bbg-card-base p-3 text-center text-sm">
            <span className="text-bbg-muted">Waiting on </span>
            <span className="text-bbg-gold font-bold">{currentPlayer?.name || '—'}</span>
          </div>
        )}

        {tile && <TileInspector tile={tile} scores={scores} />}
      </aside>

      <ActionConfirm />
      <CardTargetPicker />
      <ScoutPicker />
      <ScoutResult />
      <RadioWidget position="bottom-left" />

      <button
        onClick={() => setHelpOpen(true)}
        className="fixed top-4 right-4 z-30 bbg-card-base px-3 py-2 flex items-center gap-2 hover:scale-105 transition"
        style={{ borderColor: 'var(--bbg-gold)' }}
        title="Game guide"
      >
        <span className="text-xl">📖</span>
        <span className="font-display text-sm tracking-wider">HOW TO PLAY</span>
      </button>
      {helpOpen && <HowToPlay onClose={() => setHelpOpen(false)} embedded />}
    </div>
  );
}

function isValidCardTile(tile, filter, mySocketId) {
  if (!tile) return false;
  switch (filter) {
    case 'tile_enemy':    return tile.owner && tile.owner !== mySocketId && tile.tier > 0;
    case 'tile_enemy_t1': return tile.owner && tile.owner !== mySocketId && tile.tier === 1;
    case 'tile_any':      return !!tile.owner;
    default:              return true;
  }
}
