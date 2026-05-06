class GangWarsBot {
  constructor(socketId, factionId, difficulty = 'medium') {
    this.socketId = socketId;
    this.faction = factionId;
    this.difficulty = difficulty;
  }

  decideAction(engine, botSocketId) {
    const state = engine.state;
    const player = state.players[botSocketId];
    if (!player || player.isEliminated) return null;

    const phase = state.currentPhase;
    if (phase === 'roll') return { action: 'rollDice' };
    if (phase === 'act') return this.decideActPhase(engine, botSocketId, player, state);
    return { action: 'endTurn' };
  }

  decideActPhase(engine, botSocketId, player, state) {
    const canDevelop = player.territories.filter(tileKey => {
      const tile = state.board.tileMap[tileKey];
      return tile && tile.tier < 3 && player.resources.cash >= 150;
    });

    if (canDevelop.length > 0 && Math.random() < 0.6) {
      const target = canDevelop[Math.floor(Math.random() * canDevelop.length)];
      return { action: 'developTerritory', tileKey: target };
    }

    const unclaimed = Object.values(state.board.tileMap)
      .filter(t => !t.owner && t.type !== 'wild' && player.resources.cash >= 100);

    if (unclaimed.length > 0 && Math.random() < 0.5) {
      const adjacent = this.findAdjacent(unclaimed, player.territories, state.board);
      const target = adjacent.length > 0
        ? adjacent[0]
        : unclaimed[Math.floor(Math.random() * unclaimed.length)];
      return { action: 'claimTerritory', tileKey: target.key };
    }

    if (this.difficulty === 'hard' || (this.difficulty === 'medium' && Math.random() < 0.3)) {
      const targets = Object.values(state.board.tileMap)
        .filter(t => t.owner && t.owner !== botSocketId &&
          !state.players[t.owner]?.immuneUntilRound &&
          player.resources.muscle >= 200);

      if (targets.length > 0) {
        const weak = targets.sort((a, b) => a.tier - b.tier);
        return { action: 'attack', tileKey: weak[0].key };
      }
    }

    if (player.hand.length > 0 && Math.random() < 0.3) {
      const card = player.hand.find(c => engine.canAfford(player, c.cost || {}));
      if (card) {
        const targetId = Object.keys(state.players)
          .find(id => id !== botSocketId && !state.players[id].isEliminated);
        return { action: 'playCard', cardInstanceId: card.instanceId, options: { targetId } };
      }
    }

    return { action: 'endTurn' };
  }

  findAdjacent(unclaimed, territories, board) {
    const dirs = [[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]];
    return unclaimed.filter(tile =>
      territories.some(tileKey => {
        const ownedTile = board.tileMap[tileKey];
        if (!ownedTile) return false;
        return dirs.some(([dq, dr]) =>
          ownedTile.q + dq === tile.q && ownedTile.r + dr === tile.r);
      })
    );
  }
}

function runBotTurn(engine, botSocketId) {
  const player = engine.state.players[botSocketId];
  if (!player || !player.isBot || player.isEliminated) return;

  const bot = new GangWarsBot(botSocketId, player.faction, 'medium');
  let safety = 0;
  while (engine.currentPlayerSocket() === botSocketId && engine.state.phase === 'playing' && safety < 20) {
    safety++;
    const decision = bot.decideAction(engine, botSocketId);
    if (!decision) break;
    let result;
    if (decision.action === 'rollDice') result = engine.rollDice(botSocketId);
    else if (decision.action === 'claimTerritory') result = engine.claimTerritory(botSocketId, decision.tileKey);
    else if (decision.action === 'developTerritory') result = engine.developTerritory(botSocketId, decision.tileKey);
    else if (decision.action === 'attack') result = engine.attack(botSocketId, decision.tileKey);
    else if (decision.action === 'playCard') result = engine.playCard(botSocketId, decision.cardInstanceId, decision.options);
    else if (decision.action === 'endTurn') { engine.endTurn(botSocketId); break; }
    if (result?.error) {
      engine.endTurn(botSocketId);
      break;
    }
  }
}

module.exports = { GangWarsBot, runBotTurn };
