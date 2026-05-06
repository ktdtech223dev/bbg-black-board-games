const FACTIONS = {
  oblock: {
    id: 'oblock',
    name: 'O Block Warriors',
    city: 'Chicago',
    color: '#cc2222',
    colorDark: '#881111',
    motto: 'Hold the Block or Die Tryin',
    playstyle: 'Defense',
    difficulty: 'Easy',
    starting: { cash: 150, muscle: 300, clout: 100, connect: 100, cards: 3, preClaimedDistricts: 1 },
    passive: {
      name: 'Iron Grip',
      desc: 'Earn +2 Muscle from any district held 3+ consecutive rounds',
      apply: (state, playerId) => {
        const player = state.players[playerId];
        if (!player) return;
        player.territories.forEach(tid => {
          const t = state.board.tileMap[tid];
          if (t && (t.heldRounds?.[playerId] || 0) >= 3) {
            player.resources.muscle += 2;
          }
        });
      }
    },
    active: {
      name: 'Hold the Block',
      desc: 'Roll defense dice twice, keep the higher result. Once per turn.',
      cooldown: 1,
      cost: { muscle: 0 },
      apply: (state, playerId) => {
        state.players[playerId].defenseRolls = 2;
      }
    },
    abilityTrigger: 'onAttacked',
  },

  compton: {
    id: 'compton',
    name: 'Compton Controllers',
    city: 'Compton',
    color: '#2255cc',
    colorDark: '#112288',
    motto: 'Money Over Everything',
    playstyle: 'Economy',
    difficulty: 'Medium',
    starting: { cash: 400, muscle: 100, clout: 150, connect: 100, cards: 3, preClaimedDistricts: 0 },
    passive: {
      name: 'West Coast Financing',
      desc: 'Earn half Cash from your districts even when their number is not rolled',
      apply: (state, playerId) => {
        const player = state.players[playerId];
        if (!player) return;
        player.territories.forEach(tid => {
          const tile = state.board.tileMap[tid];
          if (tile && tile.type === 'trap') {
            player.resources.cash += Math.floor((tile.baseYield || 80) / 2);
          }
        });
      }
    },
    active: {
      name: 'West Coast Financing',
      desc: 'Develop any territory at 25% discount. Once per turn.',
      cooldown: 1,
      cost: { cash: 0 },
      apply: (state, playerId) => {
        state.players[playerId].developmentDiscount = 0.25;
      }
    },
  },

  newyork: {
    id: 'newyork',
    name: 'New York Rats',
    city: 'New York',
    color: '#ccaa00',
    colorDark: '#886600',
    motto: 'Streets is Watching',
    playstyle: 'Information',
    difficulty: 'Hard',
    starting: { cash: 200, muscle: 150, clout: 150, connect: 350, cards: 5, preClaimedDistricts: 0 },
    passive: {
      name: 'Free Pass',
      desc: 'Never pay tax on the first enemy district you pass through each round',
      apply: (state, playerId) => {
        state.players[playerId].freePasses = 1;
      }
    },
    active: {
      name: 'Street Intel',
      desc: "Peek at any player's full hand OR full resource count. Once per turn.",
      cooldown: 1,
      cost: { connect: 50 },
      apply: (state, playerId, targetId, revealType) => {
        return {
          type: 'reveal',
          target: targetId,
          reveal: revealType,
          data: revealType === 'hand'
            ? state.players[targetId]?.hand
            : state.players[targetId]?.resources
        };
      }
    },
  },

  atlanta: {
    id: 'atlanta',
    name: 'Atlanta-Stan Soldiers',
    city: 'Atlanta',
    color: '#22aa44',
    colorDark: '#116622',
    motto: 'Trap or Die',
    playstyle: 'Clout',
    difficulty: 'Medium',
    starting: { cash: 150, muscle: 150, clout: 350, connect: 100, cards: 3, preClaimedDistricts: 0 },
    passive: {
      name: 'Trap Star',
      desc: 'Bonus Clout income when owning 3+ connected districts',
      apply: (state, playerId) => {
        const player = state.players[playerId];
        if (!player) return;
        const connected = getLargestConnected(player.territories, state.board);
        if (connected >= 3) player.resources.clout += connected * 15;
      }
    },
    active: {
      name: 'Flip the Bag',
      desc: 'Convert any resource 2:1 into Clout. Once per turn.',
      cooldown: 1,
      cost: {},
      apply: (state, playerId, resource, amount) => {
        const player = state.players[playerId];
        if (player.resources[resource] >= amount) {
          player.resources[resource] -= amount;
          player.resources.clout += Math.floor(amount / 2);
        }
      }
    },
  },

  craigwood: {
    id: 'craigwood',
    name: 'Craigwood Gangstas',
    city: 'Craigwood',
    color: '#cc6600',
    colorDark: '#884400',
    motto: 'Ride or Die, No In Between',
    playstyle: 'Chaos',
    difficulty: 'Hard',
    starting: { cash: 200, muscle: 200, clout: 200, connect: 150, cards: 6, preClaimedDistricts: 0 },
    passive: {
      name: 'Ride or Die',
      desc: 'Draw 1 extra card whenever any Event card is triggered',
      trigger: 'onEvent',
      apply: (state, playerId) => { drawCards(state, playerId, 1); }
    },
    active: {
      name: 'Wild Out',
      desc: 'Spend 3 of any resource to force any player to reroll any dice. Once per turn.',
      cooldown: 1,
      cost: { any: 3 },
      apply: (state, playerId, targetId, diceType) => {
        return { type: 'forceReroll', target: targetId, dice: diceType };
      }
    },
  },

  lakings: {
    id: 'lakings',
    name: 'LA Kings',
    city: 'Los Angeles',
    color: '#8822cc',
    colorDark: '#551188',
    motto: 'Hollywood with the Muscle',
    playstyle: 'Soft Power',
    difficulty: 'Medium',
    starting: { cash: 200, muscle: 200, clout: 200, connect: 200, cards: 3, preClaimedDistricts: 0 },
    passive: {
      name: 'Industry Plant',
      desc: 'Earn 1 Clout from every trade that happens at the table',
      trigger: 'onAnyTrade',
      apply: (state, playerId) => {
        if (state.players[playerId]) state.players[playerId].resources.clout += 1;
      }
    },
    active: {
      name: 'Front Operations',
      desc: 'Make up to 5 resources untaxable this round. Once per turn.',
      cooldown: 1,
      cost: { clout: 50 },
      apply: (state, playerId, amount) => {
        state.players[playerId].untaxableResources = Math.min(5, amount || 5);
      }
    },
  },
};

function getLargestConnected(territories, board) {
  if (!territories || territories.length === 0) return 0;
  let max = 0;
  const visited = new Set();
  territories.forEach(tid => {
    if (visited.has(tid)) return;
    let count = 0;
    const stack = [tid];
    while (stack.length) {
      const curr = stack.pop();
      if (visited.has(curr)) continue;
      visited.add(curr);
      count++;
      const tile = board.tileMap[curr];
      if (!tile) continue;
      getNeighborIds(tile, board).forEach(nid => {
        if (territories.includes(nid) && !visited.has(nid)) stack.push(nid);
      });
    }
    max = Math.max(max, count);
  });
  return max;
}

function getNeighborIds(tile, board) {
  const dirs = [[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]];
  return dirs.map(([dq, dr]) => {
    const key = `${tile.q + dq},${tile.r + dr}`;
    return board.tileMap?.[key] ? key : null;
  }).filter(Boolean);
}

function drawCards(state, playerId, count) {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      state.deck = state.discard.splice(0).sort(() => Math.random() - 0.5);
    }
    if (state.deck.length > 0 && state.players[playerId]) {
      state.players[playerId].hand.push(state.deck.pop());
    }
  }
}

module.exports = { FACTIONS, getLargestConnected, getNeighborIds, drawCards };
