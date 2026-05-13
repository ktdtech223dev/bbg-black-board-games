const { drawCards } = require('./Factions');

// target: how the card asks for input from the player.
//   null              — no input needed, plays immediately
//   'player'          — pick another live player
//   'tile_enemy'      — pick a tile owned by another player (tier > 0)
//   'tile_enemy_t1'   — pick an enemy tier-1 tile
//   'tile_any'        — pick any tile (typically owned)
//   'player+resource' — pick player + which resource to demand

// v1.8: events are no longer drawn into hands. The action deck is the
// only source of cards. Every card has been revamped to feel like a
// real, situational power — stronger ratios, secondary effects, or
// new mechanics (auto-claim, wealthiest-target, one-shot shield).

const ACTION_CARDS = [
  // ── ECONOMIC ENGINE ──────────────────────────────────────────
  { id:'cartel_bag', name:'Cartel Bag', type:'action', rarity:'common', count:3, cost:{},
    target:null,
    desc:'Gain +50 of EVERY resource', flavor:'Everybody eats tonight.',
    apply: (state, playerId) => {
      const r = state.players[playerId].resources;
      r.cash += 50; r.muscle += 50; r.clout += 50; r.connect += 50;
      return { gained: 200 };
    }
  },
  { id:'plug_drop', name:'Plug Drop', type:'action', rarity:'common', count:3, cost:{ cash:150 },
    target:null,
    desc:'+250 of a random resource', flavor:'The plug came through.',
    apply: (state, playerId) => {
      const RES = ['cash','muscle','clout','connect'];
      const r = RES[Math.floor(Math.random() * RES.length)];
      state.players[playerId].resources[r] += 250;
      return { gained: r, amount: 250 };
    }
  },
  { id:'come_up', name:'Come Up', type:'action', rarity:'common', count:3, cost:{},
    target:null,
    desc:'Draw 3 cards, keep top 2', flavor:'Every dog has its day.',
    apply: (state, playerId) => {
      const drawn = [];
      for (let i = 0; i < 3; i++) {
        if (state.deck.length === 0) break;
        drawn.push(state.deck.pop());
      }
      const keep = drawn.slice(0, 2);
      keep.forEach(c => state.players[playerId].hand.push(c));
      drawn.slice(2).forEach(c => state.discard.push(c));
      return { drew: keep.length };
    }
  },
  { id:'loaded', name:'Loaded', type:'action', rarity:'common', count:2, cost:{ cash:300 },
    target:null,
    desc:'Draw 4 cards immediately', flavor:'Pockets full, hand stacked.',
    apply: (state, playerId) => {
      drawCards(state, playerId, 4);
      return { drew: 4 };
    }
  },

  // ── CONVERSIONS (better ratios than v1.7) ────────────────────
  { id:'bag_run', name:'Bag Run', type:'action', rarity:'common', count:3, cost:{ muscle:100 },
    target:null,
    desc:'Convert: 100 Muscle → +250 Cash', flavor:'Move the bag, get the bag.',
    apply: (state, playerId) => {
      state.players[playerId].resources.cash += 250;
      return { gained: 'cash', amount: 250 };
    }
  },
  { id:'recruit', name:'Recruit', type:'action', rarity:'common', count:3, cost:{ cash:200 },
    target:null,
    desc:'Convert: 200 Cash → +250 Muscle + 50 Clout', flavor:'Brought the team together.',
    apply: (state, playerId) => {
      state.players[playerId].resources.muscle += 250;
      state.players[playerId].resources.clout += 50;
      return { gained: 'muscle+clout' };
    }
  },
  { id:'network', name:'Network', type:'action', rarity:'common', count:3, cost:{ cash:100 },
    target:null,
    desc:'Convert: 100 Cash → +250 Connect', flavor:'Made the right calls.',
    apply: (state, playerId) => {
      state.players[playerId].resources.connect += 250;
      return { gained: 'connect', amount: 250 };
    }
  },
  { id:'influence', name:'Influence', type:'action', rarity:'common', count:3, cost:{ cash:100 },
    target:null,
    desc:'Convert: 100 Cash → +250 Clout', flavor:'Buying the room.',
    apply: (state, playerId) => {
      state.players[playerId].resources.clout += 250;
      return { gained: 'clout', amount: 250 };
    }
  },

  // ── TILE WARFARE ─────────────────────────────────────────────
  { id:'land_grab', name:'Land Grab', type:'action', rarity:'uncommon', count:2, cost:{ cash:150 },
    target:null,
    desc:'Auto-claim a random unclaimed tile (no targeting needed)', flavor:'Plant the flag where nobody\'s looking.',
    apply: (state, playerId) => {
      const unclaimed = Object.values(state.board.tileMap).filter(t => !t.owner && t.type !== 'wild');
      if (unclaimed.length === 0) return null;
      const tile = unclaimed[Math.floor(Math.random() * unclaimed.length)];
      tile.owner = playerId;
      tile.tier = 1;
      tile.heldRounds = { [playerId]: 0 };
      state.players[playerId].territories.push(tile.key);
      return { claimed: tile.key };
    }
  },
  { id:'glow_up', name:'Glow Up', type:'action', rarity:'uncommon', count:2, cost:{ clout:200 },
    target:null,
    desc:'Free 1-tier upgrade on your lowest tile; if upgraded to Empire (T3), draw a card', flavor:'New jewelry, new whip, new everything.',
    apply: (state, playerId) => {
      const me = state.players[playerId];
      const candidates = (me?.territories || [])
        .map(k => state.board.tileMap[k])
        .filter(t => t && t.tier > 0 && t.tier < 3);
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => a.tier - b.tier);
      const target = candidates[0];
      target.tier++;
      if (target.tier === 3) drawCards(state, playerId, 1);
      return { upgraded: target.key, newTier: target.tier, bonusDraw: target.tier === 3 };
    }
  },
  { id:'drive_by', name:'Drive-By', type:'action', rarity:'uncommon', count:2, cost:{ muscle:150 },
    target:'tile_enemy',
    desc:'Destroy 1 tier on enemy tile + deal 50 Muscle damage to its owner', flavor:'Slow down. Aim. Speed up.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (!tile || !tile.owner || tile.owner === playerId || tile.tier === 0) return null;
      const victim = state.players[tile.owner];
      tile.tier--;
      if (tile.tier === 0) tile.owner = null;
      if (victim) {
        const dmg = Math.min(50, victim.resources.muscle || 0);
        victim.resources.muscle -= dmg;
      }
      return { tileKey, newTier: tile.tier };
    }
  },
  { id:'bail_money', name:'Bail Money', type:'action', rarity:'uncommon', count:2, cost:{ cash:350 },
    target:'tile_enemy',
    desc:'Reset enemy tile to unclaimed + you gain +100 Cash from the chaos', flavor:'They out. The block up for grabs.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (!tile) return null;
      const prev = tile.owner;
      if (prev && state.players[prev]) {
        state.players[prev].territories = state.players[prev].territories.filter(t => t !== tileKey);
      }
      tile.owner = null;
      tile.tier = 0;
      state.players[playerId].resources.cash += 100;
      return { reset: tileKey, bonus: 100 };
    }
  },
  { id:'hostile_takeover', name:'Hostile Takeover', type:'action', rarity:'rare', count:2, cost:{ muscle:400, cash:250 },
    target:'tile_enemy_t1',
    desc:'Claim any Tier-1 enemy tile without combat', flavor:'Corporate raiders in Timbs.',
    apply: (state, playerId, tileKey) => {
      const tile = state.board.tileMap[tileKey];
      if (tile && tile.tier === 1 && tile.owner !== playerId) {
        const prev = tile.owner;
        if (prev && state.players[prev]) {
          state.players[prev].territories = state.players[prev].territories.filter(t => t !== tileKey);
        }
        tile.owner = playerId;
        tile.tier = 1;
        tile.heldRounds = { [playerId]: 0 };
        state.players[playerId].territories.push(tileKey);
        return { taken: tileKey };
      }
      return null;
    }
  },
  { id:'territory_swap', name:'Territory Swap', type:'action', rarity:'rare', count:1, cost:{ connect:350 },
    target:'tile_enemy',
    desc:'Force-trade your last claimed tile for any enemy tile (tiers carry over)', flavor:'Business is business.',
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

  // ── ATTACK / STEAL ───────────────────────────────────────────
  { id:'shakedown', name:'Shakedown', type:'action', rarity:'common', count:3, cost:{ muscle:100 },
    target:'player',
    desc:"Steal 50% of target's Cash", flavor:'Pay up or get touched.',
    apply: (state, playerId, targetId) => {
      const target = state.players[targetId];
      if (!target) return null;
      const amount = Math.floor((target.resources.cash || 0) * 0.5);
      target.resources.cash -= amount;
      state.players[playerId].resources.cash += amount;
      return { amount, targetId };
    }
  },
  { id:'heist', name:'Heist', type:'action', rarity:'uncommon', count:2, cost:{ muscle:200 },
    target:'player+resource',
    desc:'Steal 300 of one resource from target', flavor:'In and out, no witnesses.',
    apply: (state, playerId, targetId, resource) => {
      const target = state.players[targetId];
      if (!target || !resource) return null;
      const grab = Math.min(target.resources[resource] || 0, 300);
      target.resources[resource] -= grab;
      state.players[playerId].resources[resource] = (state.players[playerId].resources[resource] || 0) + grab;
      return { stolen: grab, resource };
    }
  },
  { id:'extortion', name:'Extortion', type:'action', rarity:'uncommon', count:3, cost:{ muscle:200 },
    target:'player+resource',
    desc:'Demand 250 of one resource — refusal costs them a tier', flavor:'Pay the toll.',
    apply: (state, playerId, targetId, resource) => {
      const target = state.players[targetId];
      if (!target) return null;
      if ((target.resources[resource] || 0) >= 250) {
        target.resources[resource] -= 250;
        state.players[playerId].resources[resource] = (state.players[playerId].resources[resource] || 0) + 250;
        return { paid: 250, resource };
      } else {
        const owned = target.territories.filter(k => (state.board.tileMap[k]?.tier || 0) > 0);
        if (owned.length > 0) {
          state.board.tileMap[owned[0]].tier--;
          return { tierLoss: owned[0] };
        }
      }
      return null;
    }
  },
  { id:'kingslayer', name:'Kingslayer', type:'action', rarity:'rare', count:1, cost:{ muscle:300 },
    target:null,
    desc:"Auto-target the wealthiest player — steal 20% of ALL their resources", flavor:"Crown's heavy. Time to take it.",
    apply: (state, playerId) => {
      const me = state.players[playerId];
      const candidates = Object.entries(state.players)
        .filter(([id, p]) => id !== playerId && !p.isEliminated)
        .map(([id, p]) => ({
          id, p, wealth: Object.values(p.resources).reduce((a,b) => a + (b || 0), 0)
        }))
        .sort((a, b) => b.wealth - a.wealth);
      if (candidates.length === 0) return null;
      const target = candidates[0];
      const stolen = {};
      ['cash','muscle','clout','connect'].forEach(r => {
        const grab = Math.floor((target.p.resources[r] || 0) * 0.2);
        if (grab > 0) {
          target.p.resources[r] -= grab;
          me.resources[r] = (me.resources[r] || 0) + grab;
          stolen[r] = grab;
        }
      });
      return { targetId: target.id, stolen };
    }
  },

  // ── DEFENSE / CONTROL ────────────────────────────────────────
  { id:'witness_protection', name:'Witness Protection', type:'action', rarity:'rare', count:2, cost:{ connect:200 },
    target:null,
    desc:'Immune to all attacks AND tax-free for 1 full round', flavor:'Relocated. Untouchable.',
    apply: (state, playerId) => {
      const p = state.players[playerId];
      p.immuneUntilRound = state.round + 1;
      p.taxImmuneUntilRound = state.round + 1;
      return { until: state.round + 1 };
    }
  },
  { id:'block_party', name:'Block Party', type:'action', rarity:'rare', count:2, cost:{ clout:200 },
    target:null,
    desc:'Doubles your tax rate this round', flavor:"It's a celebration... for your wallet.",
    apply: (state, playerId) => {
      state.players[playerId].doubleTaxThisRound = true;
      return { ok: true };
    }
  },
  { id:'flip_script', name:'Flip the Script', type:'action', rarity:'rare', count:2, cost:{ clout:250 },
    target:null,
    desc:'Reverse tax this round — collect from the taxer instead', flavor:'Plot twist.',
    apply: (state, playerId) => {
      state.players[playerId].taxReversed = true;
      return { ok: true };
    }
  },
  { id:'lawyer_up', name:'Lawyer Up', type:'action', rarity:'rare', count:1, cost:{ connect:300 },
    target:null,
    desc:'Cancel the NEXT card played against you (one-shot shield)', flavor:"My lawyer will see you now.",
    apply: (state, playerId) => {
      state.players[playerId].lawyerShield = 1;
      return { shielded: true };
    }
  },

  // ── DISRUPTION ───────────────────────────────────────────────
  { id:'smoke_out', name:'Smoke Out', type:'action', rarity:'uncommon', count:2, cost:{ muscle:100 },
    target:'player',
    desc:'Target discards 2 random cards', flavor:'Smoke that block.',
    apply: (state, playerId, targetId) => {
      const target = state.players[targetId];
      if (!target) return null;
      const out = [];
      for (let i = 0; i < 2; i++) {
        if (target.hand.length === 0) break;
        const idx = Math.floor(Math.random() * target.hand.length);
        const [card] = target.hand.splice(idx, 1);
        state.discard.push(card);
        out.push(card.name);
      }
      return { discarded: out };
    }
  },
  { id:'snitch', name:'Snitch', type:'action', rarity:'uncommon', count:2, cost:{ connect:100 },
    target:'player',
    desc:"Reveal target's hand to all + force them to discard their most expensive card", flavor:'12 in the building.',
    apply: (state, playerId, targetId) => {
      const target = state.players[targetId];
      if (!target) return null;
      const revealed = [...target.hand];
      if (target.hand.length > 0) {
        // Pick the most expensive card (sum of cost values)
        let maxCost = -1, maxIdx = 0;
        target.hand.forEach((c, i) => {
          const total = Object.values(c.cost || {}).reduce((a,b) => a + b, 0);
          if (total > maxCost) { maxCost = total; maxIdx = i; }
        });
        const [discarded] = target.hand.splice(maxIdx, 1);
        state.discard.push(discarded);
        return { type:'revealHand', target:targetId, hand:revealed, discarded: discarded.name };
      }
      return { type:'revealHand', target:targetId, hand:revealed };
    }
  },
  { id:'under_the_table', name:'Under the Table', type:'action', rarity:'common', count:3, cost:{},
    target:null,
    desc:'All your trades this round are tax-free AND grant +1 Clout each', flavor:'No receipts. No records.',
    apply: (state, playerId) => {
      state.players[playerId].taxFreeTrades = 99;
      state.players[playerId].tradeCloutBonus = 1;
      return { ok: true };
    }
  },
];

// Event cards still defined but NOT included in the deck (v1.8 retired
// them from card-draw). Kept here in case we want to fire them on a
// timer or special trigger in the future.
const EVENT_CARDS = [];

function buildDeck() {
  const cards = [];
  ACTION_CARDS.forEach(card => {
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
