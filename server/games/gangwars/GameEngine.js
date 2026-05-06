const { FACTIONS, drawCards } = require('./Factions');
const { buildDeck } = require('./CardDeck');
const { PERMANENT_MAPS, SEASONAL_MAPS } = require('./Maps');
const { getCurrentWeeklyMaps } = require('../../hub/WeeklyMaps');
const { resolveCombat } = require('./Combat');

const DEVELOPMENT_COSTS = {
  1: { cash: 150 },
  2: { cash: 300 },
  3: { cash: 600 },
};

const DEVELOPMENT_YIELD = [0, 2, 3, 4];
const TAX_RATES = [0, 50, 150, 350];
const CLAIM_COST = { cash: 100 };

const WIN_THRESHOLD = {
  quick: 1000,
  medium: 2000,
  long: null,
};

function typeToResource(type) {
  const map = {
    trap: 'cash',
    corner: 'muscle',
    social: 'clout',
    underground: 'connect',
    wild: ['cash','muscle','clout','connect'][Math.floor(Math.random()*4)],
  };
  return map[type] || 'cash';
}

class GangWarsEngine {
  constructor(io, lobbyId, config) {
    this.io = io;
    this.lobbyId = lobbyId;
    this.config = config;

    this.state = {
      phase: 'setup',
      round: 0,
      turn: 0,
      turnOrder: [],
      players: {},
      board: null,
      deck: [],
      discard: [],
      log: [],
      roundModifiers: {},
      currentPhase: 'roll',
      currentRoll: null,
      winner: null,
      startedAt: null,
      endedAt: null,
    };
  }

  initPlayers(playerList) {
    playerList.forEach(p => {
      this.state.players[p.socketId] = {
        socketId: p.socketId,
        playerId: p.playerId,
        name: p.displayName,
        color: p.color,
        avatar: p.avatar,
        faction: p.faction || null,
        resources: { cash: 0, muscle: 0, clout: 0, connect: 0 },
        hand: [],
        territories: [],
        isEliminated: false,
        isBot: p.isBot || false,
        abilityUsed: false,
        defenseRolls: 1,
        freePasses: 0,
        immuneUntilRound: null,
        taxFreeTrades: 0,
        doubleTaxThisRound: false,
        taxReversed: false,
        untaxableResources: 0,
        developmentDiscount: 0,
        score: 0,
      };
    });
    this.state.turnOrder = playerList.map(p => p.socketId);
    this.state.deck = buildDeck();
  }

  selectFaction(socketId, factionId) {
    const taken = Object.values(this.state.players).some(p => p.faction === factionId);
    if (taken) return { error: 'Faction taken' };

    const faction = FACTIONS[factionId];
    if (!faction) return { error: 'Unknown faction' };

    const player = this.state.players[socketId];
    if (!player) return { error: 'Player not in game' };

    player.faction = factionId;
    player.resources = {
      cash: faction.starting.cash,
      muscle: faction.starting.muscle,
      clout: faction.starting.clout,
      connect: faction.starting.connect,
    };

    for (let i = 0; i < faction.starting.cards; i++) {
      if (this.state.deck.length > 0) player.hand.push(this.state.deck.pop());
    }

    return { success: true };
  }

  initBoard(mapId) {
    let mapData;
    if (mapId.startsWith('weekly_')) {
      const { mapA, mapB } = getCurrentWeeklyMaps();
      mapData = mapId.endsWith('_a') ? { layout: { tileMap: mapA.tileMap, tiles: mapA.tiles, size: mapA.size }, theme: mapA.theme }
        : { layout: { tileMap: mapB.tileMap, tiles: mapB.tiles, size: mapB.size }, theme: mapB.theme };
    } else if (PERMANENT_MAPS[mapId]) {
      mapData = PERMANENT_MAPS[mapId];
    } else if (SEASONAL_MAPS[mapId]) {
      mapData = SEASONAL_MAPS[mapId];
    }

    if (!mapData) return { error: 'Map not found' };

    const layout = mapData.layout;
    this.state.board = {
      tileMap: JSON.parse(JSON.stringify(layout.tileMap)),
      tiles: layout.tiles,
      size: layout.size,
      mapId,
      theme: mapData.theme,
      modifiers: mapData.modifiers || {},
    };

    Object.entries(this.state.players).forEach(([sid, player]) => {
      const faction = FACTIONS[player.faction];
      if (!faction) return;
      const preCount = faction.starting.preClaimedDistricts;
      if (preCount > 0) {
        const unclaimed = Object.values(this.state.board.tileMap)
          .filter(t => !t.owner && t.type !== 'wild')
          .sort(() => Math.random() - 0.5);
        for (let i = 0; i < preCount && i < unclaimed.length; i++) {
          unclaimed[i].owner = sid;
          unclaimed[i].tier = 1;
          unclaimed[i].heldRounds = { [sid]: 0 };
          player.territories.push(unclaimed[i].key);
        }
      }
    });

    return { success: true };
  }

  startGame() {
    this.state.phase = 'playing';
    this.state.round = 1;
    this.state.turn = 0;
    this.state.startedAt = Date.now();
    this.state.roundModifiers = {};
    this.state.currentPhase = 'roll';
    this.broadcast('game_started', this.getPublicState());
    this.broadcastPrivateStates();
  }

  rollDice(socketId) {
    if (!this.isCurrentTurn(socketId)) return { error: 'Not your turn' };
    if (this.state.currentPhase !== 'roll') return { error: 'Already rolled this turn' };

    const d1 = Math.ceil(Math.random() * 6);
    const d2 = Math.ceil(Math.random() * 6);
    const roll = d1 + d2;

    const collections = {};
    const modifier = this.state.roundModifiers.resourceMultiplier || 1;

    Object.values(this.state.players).filter(p => !p.isEliminated).forEach(player => {
      player.territories.forEach(tileKey => {
        const tile = this.state.board.tileMap[tileKey];
        if (!tile || tile.token !== roll) return;

        const yieldAmt = Math.floor((tile.baseYield || 80) * (DEVELOPMENT_YIELD[tile.tier || 0] || 0) * modifier / 10);
        if (yieldAmt <= 0) return;

        const resource = typeToResource(tile.type);
        player.resources[resource] += yieldAmt;

        if (!collections[player.socketId]) collections[player.socketId] = {};
        collections[player.socketId][resource] = (collections[player.socketId][resource] || 0) + yieldAmt;
      });

      if (player.faction === 'compton') {
        FACTIONS.compton.passive.apply(this.state, player.socketId);
      }
    });

    Object.values(this.state.board.tileMap).forEach(tile => {
      if (tile.owner) {
        if (!tile.heldRounds) tile.heldRounds = {};
        tile.heldRounds[tile.owner] = (tile.heldRounds[tile.owner] || 0) + 1;
      }
    });

    Object.entries(this.state.players).forEach(([sid, p]) => {
      if (p.faction === 'oblock' && !p.isEliminated) {
        FACTIONS.oblock.passive.apply(this.state, sid);
      }
    });

    this.drawCardForCurrentPlayer();

    this.state.currentRoll = roll;
    this.state.currentPhase = 'act';

    this.broadcast('dice_rolled', {
      roll, d1, d2, collections,
      currentPlayer: this.currentPlayerSocket(),
    });

    this.log(`🎲 Roll: ${roll} (${d1}+${d2})`);
    this.broadcastPrivateStates();
    return { roll, d1, d2, collections };
  }

  drawCardForCurrentPlayer() {
    const sid = this.currentPlayerSocket();
    const player = this.state.players[sid];
    if (!player) return;
    drawCards(this.state, sid, 1);

    const drawn = player.hand[player.hand.length - 1];
    if (drawn?.type === 'event') {
      try { drawn.apply(this.state); } catch (e) {}
      Object.entries(this.state.players).forEach(([id, p]) => {
        if (p.faction === 'craigwood' && !p.isEliminated) {
          drawCards(this.state, id, 1);
        }
      });
      this.broadcast('event_triggered', { card: drawn, socketId: sid });
    }
  }

  claimTerritory(socketId, tileKey) {
    if (!this.isCurrentTurn(socketId)) return { error: 'Not your turn' };
    if (this.state.currentPhase !== 'act') return { error: 'Not act phase' };

    const player = this.state.players[socketId];
    const tile = this.state.board.tileMap[tileKey];

    if (!tile) return { error: 'Invalid tile' };
    if (tile.owner) return { error: 'Already owned' };

    const cost = { ...CLAIM_COST };
    if (!this.canAfford(player, cost)) return { error: 'Cannot afford' };

    this.deductResources(player, cost);
    tile.owner = socketId;
    tile.tier = 1;
    tile.heldRounds = { [socketId]: 0 };
    player.territories.push(tileKey);

    this.broadcast('territory_claimed', {
      socketId, tileKey,
      playerName: player.name,
      scores: this.getScores(),
    });

    this.log(`🚩 ${player.name} claimed ${tileKey}`);
    this.broadcastPrivateStates();
    return { success: true };
  }

  developTerritory(socketId, tileKey) {
    if (!this.isCurrentTurn(socketId)) return { error: 'Not your turn' };

    const player = this.state.players[socketId];
    const tile = this.state.board.tileMap[tileKey];

    if (!tile) return { error: 'Invalid tile' };
    if (tile.owner !== socketId) return { error: 'Not your territory' };
    if (tile.tier >= 3) return { error: 'Max development' };

    const nextTier = tile.tier + 1;
    let cost = { ...DEVELOPMENT_COSTS[nextTier] };

    if (player.faction === 'compton' || player.developmentDiscount > 0) {
      const disc = player.faction === 'compton' ? 0.25 : player.developmentDiscount;
      cost.cash = Math.floor(cost.cash * (1 - disc));
    }

    const mapDisc = this.state.board.modifiers?.costReduction || this.state.roundModifiers.costReduction || 0;
    cost.cash = Math.floor(cost.cash * (1 - mapDisc));

    if (!this.canAfford(player, cost)) return { error: 'Cannot afford' };

    this.deductResources(player, cost);
    tile.tier = nextTier;
    player.developmentDiscount = 0;

    this.broadcast('territory_developed', {
      socketId, tileKey, tier: nextTier,
      scores: this.getScores(),
    });

    const tierNames = ['', 'Operation', 'Trap', 'Empire'];
    this.log(`🏗️ ${player.name} built ${tierNames[nextTier]} at ${tileKey}`);
    this.broadcastPrivateStates();
    return { success: true };
  }

  attack(attackerId, tileKey) {
    if (!this.isCurrentTurn(attackerId)) return { error: 'Not your turn' };
    if (this.state.roundModifiers.noAttacks) return { error: 'No attacks this round' };

    const attacker = this.state.players[attackerId];
    const tile = this.state.board.tileMap[tileKey];

    if (!tile) return { error: 'Invalid tile' };
    if (!tile.owner || tile.owner === attackerId) return { error: 'Invalid target' };

    const defender = this.state.players[tile.owner];
    if (!defender) return { error: 'No defender' };

    if (defender.immuneUntilRound && defender.immuneUntilRound >= this.state.round) {
      return { error: 'Target is immune' };
    }

    let attackCost = 200 * (tile.tier || 1);
    attackCost = Math.floor(attackCost * (this.state.roundModifiers.attackCostMultiplier || 1));

    if (attacker.resources.muscle < attackCost) return { error: 'Insufficient Muscle' };

    attacker.resources.muscle -= attackCost;

    const { attackerWon, atkRoll, defRoll } = resolveCombat(attacker, defender, tile);
    defender.defenseRolls = 1;

    if (attackerWon) {
      defender.territories = defender.territories.filter(t => t !== tileKey);
      tile.owner = attackerId;
      tile.tier = 1;
      tile.heldRounds = { [attackerId]: 0 };
      attacker.territories.push(tileKey);

      if (defender.territories.length === 0) {
        this.eliminatePlayer(defender.socketId);
      }
    } else {
      attacker.resources.muscle -= Math.floor(attackCost * 0.5);
      if (attacker.resources.muscle < 0) attacker.resources.muscle = 0;
    }

    this.broadcast('combat_resolved', {
      attackerId, defenderId: defender.socketId,
      tileKey, atkRoll, defRoll, attackerWon,
      scores: this.getScores(),
    });

    this.log(`⚔️ ${attacker.name} ${attackerWon ? 'took' : 'failed at'} ${tileKey}`);
    this.broadcastPrivateStates();
    return { success: true, attackerWon, atkRoll, defRoll };
  }

  playCard(socketId, cardInstanceId, options = {}) {
    if (!this.isCurrentTurn(socketId)) return { error: 'Not your turn' };

    const player = this.state.players[socketId];
    const cardIdx = player.hand.findIndex(c => c.instanceId === cardInstanceId);
    if (cardIdx === -1) return { error: 'Card not in hand' };

    const card = player.hand[cardIdx];

    if (!this.canAfford(player, card.cost || {})) return { error: 'Cannot afford card' };

    this.deductResources(player, card.cost || {});
    player.hand.splice(cardIdx, 1);
    this.state.discard.push(card);

    let result = null;
    try {
      result = card.apply(this.state, socketId, options.targetId, options.param1, options.param2);
    } catch (e) { result = { error: e.message }; }

    if (card.type === 'event') {
      this.broadcast('event_triggered', { card, result, socketId });
    }

    this.broadcast('card_played', {
      socketId, card,
      playerName: player.name,
      result,
      scores: this.getScores(),
    });

    this.log(`🃏 ${player.name} played ${card.name}`);
    this.broadcastPrivateStates();
    return { success: true, result };
  }

  useFactionAbility(socketId, options = {}) {
    const player = this.state.players[socketId];
    if (!player) return { error: 'No player' };
    if (player.abilityUsed) return { error: 'Ability already used this turn' };

    const faction = FACTIONS[player.faction];
    if (!faction) return { error: 'No faction' };

    if (!this.canAfford(player, faction.active.cost || {})) return { error: 'Cannot afford ability' };

    this.deductResources(player, faction.active.cost || {});
    player.abilityUsed = true;

    const result = faction.active.apply(this.state, socketId, options.targetId, options.param1);

    this.broadcast('ability_used', {
      socketId, factionId: player.faction,
      ability: faction.active.name, result,
    });

    this.log(`⚡ ${player.name} used ${faction.active.name}`);
    this.broadcastPrivateStates();
    return { success: true, result };
  }

  proposeTrade(fromId, toId, offer, request) {
    this.broadcast('trade_proposed', {
      fromId, toId, offer, request,
      fromName: this.state.players[fromId]?.name,
      toName: this.state.players[toId]?.name,
    });

    Object.entries(this.state.players).forEach(([id, p]) => {
      if (p.faction === 'lakings' && id !== fromId && id !== toId && !p.isEliminated) {
        FACTIONS.lakings.passive.apply(this.state, id);
      }
    });
  }

  acceptTrade(fromId, toId, offer, request) {
    const from = this.state.players[fromId];
    const to = this.state.players[toId];
    if (!from || !to) return;

    Object.entries(offer || {}).forEach(([resource, amount]) => {
      if (from.resources[resource] >= amount) {
        from.resources[resource] -= amount;
        to.resources[resource] += amount;
      }
    });
    Object.entries(request || {}).forEach(([resource, amount]) => {
      if (to.resources[resource] >= amount) {
        to.resources[resource] -= amount;
        from.resources[resource] += amount;
      }
    });

    this.broadcast('trade_completed', { fromId, toId, offer, request, scores: this.getScores() });
    this.broadcastPrivateStates();
  }

  endTurn(socketId) {
    if (!this.isCurrentTurn(socketId)) return { error: 'Not your turn' };

    this.processTax(socketId);

    const player = this.state.players[socketId];
    if (player) {
      player.abilityUsed = false;
      player.doubleTaxThisRound = false;
      player.taxReversed = false;
      player.untaxableResources = 0;
      player.developmentDiscount = 0;
      player.taxFreeTrades = 0;
    }

    this.state.turn = (this.state.turn + 1) % this.state.turnOrder.length;

    let attempts = 0;
    while (this.state.players[this.currentPlayerSocket()]?.isEliminated && attempts < this.state.turnOrder.length) {
      this.state.turn = (this.state.turn + 1) % this.state.turnOrder.length;
      attempts++;
    }

    if (this.state.turn === 0) {
      this.state.round++;
      this.state.roundModifiers = {};
      Object.entries(this.state.players).forEach(([id, p]) => {
        if (p.faction === 'atlanta' && !p.isEliminated) {
          FACTIONS.atlanta.passive.apply(this.state, id);
        }
      });
    }

    const winner = this.checkWin();
    if (winner) {
      this.endGame(winner);
      return { success: true, gameEnded: true };
    }

    this.state.currentPhase = 'roll';
    this.state.currentRoll = null;

    this.broadcast('turn_ended', {
      nextPlayer: this.currentPlayerSocket(),
      round: this.state.round,
      scores: this.getScores(),
    });

    this.broadcastPrivateStates();
    return { success: true };
  }

  processTax(socketId) {
    const taxer = this.state.players[socketId];
    if (!taxer || this.state.roundModifiers.noTax) return;

    Object.entries(this.state.players).forEach(([id, player]) => {
      if (id === socketId || player.isEliminated) return;

      player.territories.forEach(tileKey => {
        const tile = this.state.board.tileMap[tileKey];
        if (!tile || tile.tier === 0) return;

        const taxAmt = TAX_RATES[tile.tier] || 0;
        if (taxAmt === 0) return;

        let finalTax = taxAmt;
        if (taxer.doubleTaxThisRound) finalTax *= 2;

        if (player.taxReversed) {
          player.resources.cash += finalTax;
          taxer.resources.cash -= Math.min(taxer.resources.cash, finalTax);
        } else {
          const canPay = Math.min(player.resources.cash, finalTax);
          player.resources.cash -= canPay;
          taxer.resources.cash += canPay;
          if (player.resources.cash < 0) player.resources.cash = 0;
          this.checkElimination(id);
        }
      });
    });
  }

  checkElimination(socketId) {
    const player = this.state.players[socketId];
    if (!player || player.isEliminated) return;
    const total = Object.values(player.resources).reduce((a, b) => a + b, 0);
    if (total <= 0 && player.territories.length === 0) {
      this.eliminatePlayer(socketId);
    }
  }

  eliminatePlayer(socketId) {
    const player = this.state.players[socketId];
    if (!player || player.isEliminated) return;
    player.isEliminated = true;
    player.territories.forEach(tileKey => {
      const tile = this.state.board.tileMap[tileKey];
      if (tile) {
        tile.owner = null;
        tile.tier = 0;
      }
    });
    player.territories = [];

    this.broadcast('player_eliminated', {
      socketId, playerName: player.name,
      scores: this.getScores(),
    });

    this.log(`💀 ${player.name} has been eliminated`);
  }

  checkWin() {
    const active = Object.entries(this.state.players).filter(([, p]) => !p.isEliminated);

    if (active.length === 1) return active[0][0];

    const threshold = WIN_THRESHOLD[this.config.mode];
    if (threshold) {
      const wealthy = active.find(([, p]) => {
        const total = Object.values(p.resources).reduce((a, b) => a + b, 0);
        return total >= threshold;
      });
      if (wealthy) return wealthy[0];
    }

    return null;
  }

  endGame(winnerSocketId) {
    this.state.phase = 'ended';
    this.state.winner = winnerSocketId;
    this.state.endedAt = Date.now();
    const duration = Math.floor((this.state.endedAt - this.state.startedAt) / 1000);

    const winner = this.state.players[winnerSocketId];

    this.broadcast('game_over', {
      winner, scores: this.getScores(),
      duration, log: this.state.log.slice(-20),
    });

    this.log(`🏆 ${winner?.name} wins!`);
    return { winner: winnerSocketId, duration };
  }

  isCurrentTurn(socketId) { return this.currentPlayerSocket() === socketId; }
  currentPlayerSocket() { return this.state.turnOrder[this.state.turn]; }

  canAfford(player, cost) {
    return Object.entries(cost).every(([res, amt]) => (player.resources[res] || 0) >= amt);
  }

  deductResources(player, cost) {
    Object.entries(cost).forEach(([res, amt]) => {
      player.resources[res] = (player.resources[res] || 0) - amt;
    });
  }

  getScores() {
    return Object.entries(this.state.players).map(([sid, p]) => ({
      socketId: sid, name: p.name, color: p.color, faction: p.faction,
      resources: p.resources, territories: p.territories.length,
      isEliminated: p.isEliminated,
      totalWealth: Object.values(p.resources).reduce((a, b) => a + b, 0),
    })).sort((a, b) => b.totalWealth - a.totalWealth);
  }

  getPublicState() {
    return {
      phase: this.state.phase,
      round: this.state.round,
      currentTurn: this.currentPlayerSocket(),
      currentPhase: this.state.currentPhase,
      currentRoll: this.state.currentRoll,
      turnOrder: this.state.turnOrder,
      board: this.getBoardState(),
      scores: this.getScores(),
      deckSize: this.state.deck.length,
      discardSize: this.state.discard.length,
      roundModifiers: this.state.roundModifiers,
      log: this.state.log.slice(-10),
    };
  }

  getPlayerPrivateState(socketId) {
    const player = this.state.players[socketId];
    return {
      ...this.getPublicState(),
      myHand: player?.hand || [],
      myResources: player?.resources || {},
      myTerritories: player?.territories || [],
      myFaction: player?.faction,
      abilityUsed: player?.abilityUsed,
    };
  }

  getBoardState() {
    if (!this.state.board) return null;
    return {
      tileMap: Object.fromEntries(
        Object.entries(this.state.board.tileMap).map(([key, tile]) => [key, {
          q: tile.q, r: tile.r, s: tile.s, key,
          type: tile.type, token: tile.token,
          owner: tile.owner, tier: tile.tier,
          neighborhood: tile.neighborhood,
          baseYield: tile.baseYield,
        }])
      ),
      size: this.state.board.size,
      mapId: this.state.board.mapId,
      theme: this.state.board.theme,
    };
  }

  log(msg) {
    this.state.log.push({ msg, round: this.state.round, time: Date.now() });
    if (this.state.log.length > 200) this.state.log.shift();
  }

  broadcast(event, data) {
    this.io.to(this.lobbyId).emit(event, data);
  }

  broadcastPrivateStates() {
    Object.keys(this.state.players).forEach(sid => {
      if (!sid.startsWith('bot-')) {
        this.io.to(sid).emit('gw:private_state', this.getPlayerPrivateState(sid));
      }
    });
  }
}

module.exports = { GangWarsEngine, WIN_THRESHOLD };
