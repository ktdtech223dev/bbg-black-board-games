const { drawCards } = require('./Factions');

// target: how the card asks for input from the player.
//   null              — no input needed, plays immediately
//   'player'          — pick another live player
//   'tile_enemy'      — pick a tile owned by another player (any tier > 0)
//   'tile_enemy_t1'   — pick an enemy tier-1 tile
//   'tile_any'        — pick any tile (typically owned)
//   'player+resource' — pick player + which resource to demand

const ACTION_CARDS = [
  { id:'shakedown', name:'Shakedown', type:'action', rarity:'common', count:3, cost:{ muscle:100 },
    target:'player',
    desc:"Collect 40% of target player's Cash", flavor:'Pay up or get touched.',
    apply: (state, playerId, targetId) => {
      const target = state.players[targetId];
      if (!target) return null;
      const amount = Math.floor(target.resources.cash * 0.4);
      target.resources.cash -= amount;
      state.players[playerId].resources.cash += amount;
      return { amount, targetId };
    }
  },
  { id:'drive_by', name:'Drive-By', type:'action', rarity:'uncommon', count:2, cost:{ muscle:150 },
    target:'tile_enemy',
    desc:'Destroy one tier of development on any enemy district', flavor:'Slow down. Aim. Speed up.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (tile && tile.owner && tile.owner !== playerId && tile.tier > 0) {
        tile.tier--;
        if (tile.tier === 0) tile.owner = null;
      }
    }
  },
  { id:'under_the_table', name:'Under the Table', type:'action', rarity:'common', count:3, cost:{},
    target:null,
    desc:'Your next trade this round is tax-free', flavor:'No receipts. No records.',
    apply: (state, playerId) => { state.players[playerId].taxFreeTrades = 1; }
  },
  { id:'block_party', name:'Block Party', type:'action', rarity:'rare', count:2, cost:{ clout:200 },
    target:null,
    desc:'All players on your districts pay double tax this round', flavor:"It's a celebration... for your wallet.",
    apply: (state, playerId) => { state.players[playerId].doubleTaxThisRound = true; }
  },
  { id:'witness_protection', name:'Witness Protection', type:'action', rarity:'rare', count:2, cost:{ connect:200 },
    target:null,
    desc:'Immune to all attacks for 1 full round', flavor:'Relocated. Untouchable.',
    apply: (state, playerId) => { state.players[playerId].immuneUntilRound = state.round + 1; }
  },
  { id:'come_up', name:'Come Up', type:'action', rarity:'common', count:4, cost:{},
    target:null,
    desc:'Draw 3 cards, keep 2 (auto)', flavor:'Every dog has its day.',
    apply: (state, playerId) => {
      const drawn = [];
      for (let i = 0; i < 3; i++) {
        if (state.deck.length === 0) break;
        drawn.push(state.deck.pop());
      }
      const keep = drawn.slice(0, 2);
      keep.forEach(c => state.players[playerId].hand.push(c));
      drawn.slice(2).forEach(c => state.discard.push(c));
      return { drawn: keep };
    }
  },
  { id:'snitch', name:'Snitch', type:'action', rarity:'uncommon', count:2, cost:{ connect:100 },
    target:'player',
    desc:"Reveal any one player's full hand to ALL players", flavor:'12 in the building.',
    apply: (state, playerId, targetId) => {
      return { type:'revealHand', target:targetId, hand: state.players[targetId]?.hand || [] };
    }
  },
  { id:'hostile_takeover', name:'Hostile Takeover', type:'action', rarity:'rare', count:2, cost:{ muscle:500, cash:300 },
    target:'tile_enemy_t1',
    desc:'Claim any Tier 1 (Operation) enemy district without combat', flavor:'Corporate raiders in Timbs.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (tile && tile.tier === 1 && tile.owner !== playerId) {
        const prev = tile.owner;
        if (prev && state.players[prev]) {
          state.players[prev].territories = state.players[prev].territories.filter(t => t !== tileKey);
        }
        tile.owner = playerId;
        tile.tier = 1;
        state.players[playerId].territories.push(tileKey);
      }
    }
  },
  { id:'flip_script', name:'Flip the Script', type:'action', rarity:'rare', count:2, cost:{ clout:300 },
    target:null,
    desc:'Reverse tax payments this round — you collect from the taxer', flavor:'Plot twist.',
    apply: (state, playerId) => { state.players[playerId].taxReversed = true; }
  },
  { id:'bail_money', name:'Bail Money', type:'action', rarity:'uncommon', count:2, cost:{ cash:400 },
    target:'tile_enemy',
    desc:'Return one enemy district to unclaimed', flavor:'They out. The block up for grabs.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (tile) {
        const prev = tile.owner;
        if (prev && state.players[prev]) {
          state.players[prev].territories = state.players[prev].territories.filter(t => t !== tileKey);
        }
        tile.owner = null;
        tile.tier = 0;
      }
    }
  },
  { id:'extortion', name:'Extortion', type:'action', rarity:'uncommon', count:3, cost:{ muscle:200 },
    target:'player+resource',
    desc:'Target player must give you 200 of one resource or lose a tier', flavor:'Pay the toll.',
    apply: (state, playerId, targetId, resource) => {
      const target = state.players[targetId];
      if (!target) return null;
      if (target.resources[resource] >= 200) {
        target.resources[resource] -= 200;
        state.players[playerId].resources[resource] += 200;
      } else {
        const owned = target.territories.filter(k => state.board.tileMap[k]?.tier > 0);
        if (owned.length > 0) {
          state.board.tileMap[owned[0]].tier--;
        }
      }
      return { type:'demand', target:targetId, resource, amount:200 };
    }
  },
  { id:'territory_swap', name:'Territory Swap', type:'action', rarity:'rare', count:1, cost:{ connect:400 },
    target:'tile_enemy',
    desc:"Force-trade your last claimed tile for any enemy tile", flavor:'Business is business.',
    apply: (state, playerId, theirTileKey) => {
      const me = state.players[playerId];
      if (!me || me.territories.length === 0) return null;
      const myTileKey = me.territories[me.territories.length - 1];
      const myTile = state.board.tileMap[myTileKey];
      const theirTile = state.board.tileMap[theirTileKey];
      if (!myTile || !theirTile || theirTile.owner === playerId) return null;
      const theirOwner = theirTile.owner;
      const them = state.players[theirOwner];
      if (!them) return null;

      // Swap ownership and tiers
      me.territories = me.territories.filter(t => t !== myTileKey);
      me.territories.push(theirTileKey);
      them.territories = them.territories.filter(t => t !== theirTileKey);
      them.territories.push(myTileKey);
      const myTier = myTile.tier;
      myTile.owner = theirOwner;
      theirTile.owner = playerId;
      myTile.tier = theirTile.tier;
      theirTile.tier = myTier;
      myTile.heldRounds = { [theirOwner]: 0 };
      theirTile.heldRounds = { [playerId]: 0 };
      return { type:'swap', myTile: theirTileKey, theirTile: myTileKey };
    }
  },

  // ── EXPANDED CARD POOL (v1.5) — adds variety + reduces softlock ────
  { id:'heist', name:'Heist', type:'action', rarity:'uncommon', count:2, cost:{ muscle:250 },
    target:'player+resource',
    desc:'Steal 250 of one resource from target player', flavor:'In and out, no witnesses.',
    apply: (state, playerId, targetId, resource) => {
      const target = state.players[targetId];
      if (!target || !resource) return null;
      const grab = Math.min(target.resources[resource] || 0, 250);
      target.resources[resource] -= grab;
      state.players[playerId].resources[resource] = (state.players[playerId].resources[resource] || 0) + grab;
      return { stolen: grab, resource };
    }
  },
  { id:'plug_drop', name:'Plug Drop', type:'action', rarity:'common', count:3, cost:{ cash:200 },
    target:null,
    desc:'Gain +200 of a random resource', flavor:'The plug came through.',
    apply: (state, playerId) => {
      const RES = ['cash','muscle','clout','connect'];
      const r = RES[Math.floor(Math.random() * RES.length)];
      state.players[playerId].resources[r] += 200;
      return { gained: r, amount: 200 };
    }
  },
  { id:'glow_up', name:'Glow Up', type:'action', rarity:'uncommon', count:2, cost:{ clout:250 },
    target:null,
    desc:'Free 1-tier upgrade on your lowest-tier owned tile', flavor:'New jewelry, new whip, new everything.',
    apply: (state, playerId) => {
      const me = state.players[playerId];
      const candidates = (me?.territories || [])
        .map(k => state.board.tileMap[k])
        .filter(t => t && t.tier > 0 && t.tier < 3);
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => a.tier - b.tier);
      const target = candidates[0];
      target.tier++;
      return { upgraded: target.key, newTier: target.tier };
    }
  },
  { id:'smoke_out', name:'Smoke Out', type:'action', rarity:'uncommon', count:2, cost:{ muscle:100 },
    target:'player',
    desc:'Target discards a random card from their hand', flavor:'Smoke that block.',
    apply: (state, playerId, targetId) => {
      const target = state.players[targetId];
      if (!target || target.hand.length === 0) return null;
      const idx = Math.floor(Math.random() * target.hand.length);
      const [card] = target.hand.splice(idx, 1);
      state.discard.push(card);
      return { discarded: card.name };
    }
  },
  { id:'loaded', name:'Loaded', type:'action', rarity:'common', count:3, cost:{ cash:300 },
    target:null,
    desc:'Draw 3 cards immediately', flavor:'Pockets full, hand stacked.',
    apply: (state, playerId) => {
      drawCards(state, playerId, 3);
      return { drew: 3 };
    }
  },
  { id:'recruit', name:'Recruit', type:'action', rarity:'common', count:3, cost:{ cash:200 },
    target:null,
    desc:'Convert 200 Cash → 200 Muscle', flavor:'Brought the team together.',
    apply: (state, playerId) => {
      state.players[playerId].resources.muscle += 200;
      return { gained: 'muscle', amount: 200 };
    }
  },
  { id:'bag_run', name:'Bag Run', type:'action', rarity:'common', count:3, cost:{ muscle:100 },
    target:null,
    desc:'Convert 100 Muscle → 200 Cash', flavor:'Move the bag, get the bag.',
    apply: (state, playerId) => {
      state.players[playerId].resources.cash += 200;
      return { gained: 'cash', amount: 200 };
    }
  },
  { id:'network', name:'Network', type:'action', rarity:'common', count:3, cost:{ cash:100 },
    target:null,
    desc:'Convert 100 Cash → 200 Connect', flavor:'Made the right calls.',
    apply: (state, playerId) => {
      state.players[playerId].resources.connect += 200;
      return { gained: 'connect', amount: 200 };
    }
  },
];

const EVENT_CARDS = [
  { id:'city_crackdown', name:'City Crackdown', type:'event', count:2,
    desc:'No attacks allowed this round. Police presence is heavy.', flavor:'They watching everybody tonight.',
    apply: (state) => { state.roundModifiers.noAttacks = true; }
  },
  { id:'economic_boom', name:'Economic Boom', type:'event', count:2,
    desc:'All districts produce double resources this round.', flavor:'Money in the air.',
    apply: (state) => { state.roundModifiers.resourceMultiplier = 2; }
  },
  { id:'gang_truce', name:'Gang Truce', type:'event', count:2,
    desc:'Mandatory trading round. No attacks. All players must make one trade offer.', flavor:'The OGs called it.',
    apply: (state) => { state.roundModifiers.noAttacks = true; state.roundModifiers.mandatoryTrade = true; }
  },
  { id:'new_blood', name:'New Blood', type:'event', count:2,
    desc:'Two unclaimed districts appear at the city edges.', flavor:'New territory just opened up.',
    apply: (state) => { state.roundModifiers.newDistricts = 2; }
  },
  { id:'the_feds', name:'The Feds', type:'event', count:2,
    desc:'Player with most Muscle loses half of it.', flavor:'They came for the biggest one.',
    apply: (state) => {
      let maxMuscle = 0, targetId = null;
      Object.entries(state.players).forEach(([id, p]) => {
        if (p.resources.muscle > maxMuscle) { maxMuscle = p.resources.muscle; targetId = id; }
      });
      if (targetId) state.players[targetId].resources.muscle = Math.floor(maxMuscle / 2);
    }
  },
  { id:'rent_strike', name:'Rent Strike', type:'event', count:2,
    desc:'No tax collection this round.', flavor:'The people said no.',
    apply: (state) => { state.roundModifiers.noTax = true; }
  },
  { id:'block_fire', name:'Block Fire', type:'event', count:2,
    desc:'A random occupied district goes neutral.', flavor:'Whole block torched.',
    apply: (state) => {
      const occupied = Object.values(state.board.tileMap).filter(t => t.owner && t.tier > 0);
      if (occupied.length > 0) {
        const target = occupied[Math.floor(Math.random() * occupied.length)];
        const prev = target.owner;
        if (prev && state.players[prev]) {
          state.players[prev].territories = state.players[prev].territories.filter(t => t !== target.key);
        }
        target.owner = null;
        target.tier = 0;
      }
    }
  },
  { id:'supply_chain', name:'Supply Chain', type:'event', count:2,
    desc:'All resource costs reduced 25% this round.', flavor:'Plug got a deal.',
    apply: (state) => { state.roundModifiers.costReduction = 0.25; }
  },
  { id:'war_season', name:'War Season', type:'event', count:2,
    desc:'All attacks cost 50% less Muscle this round. Aggression is up.', flavor:'Summer time. You know what it is.',
    apply: (state) => { state.roundModifiers.attackCostMultiplier = 0.5; }
  },
  { id:'drought', name:'The Drought', type:'event', count:2,
    desc:'Resource yields halved this round.', flavor:'Nothing moving out here.',
    apply: (state) => { state.roundModifiers.resourceMultiplier = 0.5; }
  },
];

function buildDeck() {
  const cards = [];
  ACTION_CARDS.forEach(card => {
    for (let i = 0; i < card.count; i++) {
      cards.push({ ...card, instanceId: `${card.id}-${i}-${Math.random().toString(36).slice(2,7)}` });
    }
  });
  EVENT_CARDS.forEach(card => {
    for (let i = 0; i < card.count; i++) {
      cards.push({ ...card, instanceId: `${card.id}-${i}-${Math.random().toString(36).slice(2,7)}` });
    }
  });
  return shuffle(cards);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = { ACTION_CARDS, EVENT_CARDS, buildDeck, shuffle };
