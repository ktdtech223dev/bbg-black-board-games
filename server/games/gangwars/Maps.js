function getBaseYield(type) {
  return { trap: 100, corner: 80, social: 90, underground: 85, wild: 120 }[type] || 80;
}

function weightedRandom(weights) {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of weights) {
    rand -= w.weight;
    if (rand <= 0) return w.type;
  }
  return weights[0].type;
}

function buildHexLayout(size, typeWeights, neighborhoods) {
  const tiles = [];
  const tokenPool = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
  let tokenIdx = 0;

  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size);
    const r2 = Math.min(size, -q + size);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      const key = `${q},${r}`;
      const isCenter = q === 0 && r === 0;

      let type = isCenter ? 'wild' : weightedRandom(typeWeights);

      tiles.push({
        q, r, s, key,
        type,
        token: isCenter ? null : tokenPool[tokenIdx++ % tokenPool.length],
        neighborhood: null,
        baseYield: getBaseYield(type),
        owner: null,
        tier: 0,
        isPort: false,
      });
    }
  }

  neighborhoods.forEach((hood, i) => {
    const matching = tiles.filter(t => t.type === hood.type && !t.neighborhood && t.type !== 'wild');
    const assigned = matching.slice(0, hood.size);
    assigned.forEach(t => {
      t.neighborhood = { id: i, name: hood.name, type: hood.type };
    });
  });

  const tileMap = Object.fromEntries(tiles.map(t => [t.key, t]));
  return { size, tiles, tileMap };
}

const PERMANENT_MAPS = {
  metro: {
    id: 'metro', name: 'The Metro', subtitle: 'Urban Core',
    description: 'Dense city center. Tight territory. High conflict. Every block matters.',
    type: 'permanent', playerRange: [2, 6], bestFor: 'medium', theme: 'night_rain', size: 3,
    layout: buildHexLayout(3, [
      { type:'trap', weight:3 },{ type:'corner', weight:3 },{ type:'social', weight:2 },
      { type:'underground', weight:2 },{ type:'wild', weight:1 }
    ], [
      { name:'Central Park Blocks', size:3, type:'wild' },
      { name:'The Loop', size:4, type:'trap' },
      { name:'East Side', size:3, type:'corner' },
      { name:'North End', size:3, type:'social' },
      { name:'Underground City', size:3, type:'underground' },
      { name:'South Market', size:3, type:'trap' },
    ])
  },
  sprawl: {
    id: 'sprawl', name: 'The Sprawl', subtitle: 'Suburban Empire',
    description: 'Spread out territory. Room to breathe early. Economic games dominate.',
    type: 'permanent', playerRange: [3, 8], bestFor: 'long', theme: 'golden_hour', size: 5,
    layout: buildHexLayout(5, [
      { type:'trap', weight:2 },{ type:'corner', weight:2 },{ type:'social', weight:3 },
      { type:'underground', weight:2 },{ type:'wild', weight:2 }
    ], [
      { name:'The Burbs', size:5, type:'social' },
      { name:'Shopping District', size:4, type:'trap' },
      { name:'The Warehouse District', size:4, type:'underground' },
      { name:'Parkway', size:3, type:'wild' },
      { name:'Eastview', size:4, type:'corner' },
      { name:'Westlake', size:3, type:'social' },
      { name:'Industrial Row', size:4, type:'underground' },
      { name:'Maple Heights', size:3, type:'trap' },
    ])
  },
  strip: {
    id: 'strip', name: 'The Strip', subtitle: 'Main Avenue',
    description: 'Linear map along the main drag. Choke points decide everything.',
    type: 'permanent', playerRange: [2, 4], bestFor: 'quick', theme: 'neon_night', size: 3,
    layout: buildHexLayout(3, [
      { type:'trap', weight:4 },{ type:'corner', weight:3 },{ type:'social', weight:4 },
      { type:'underground', weight:1 },{ type:'wild', weight:1 }
    ], [
      { name:'The Boulevard', size:3, type:'social' },
      { name:'Block One', size:2, type:'trap' },
      { name:'The Corner', size:2, type:'corner' },
      { name:'The Back Alley', size:2, type:'underground' },
      { name:'The Intersection', size:2, type:'wild' },
    ])
  },
  projects: {
    id: 'projects', name: 'The Projects', subtitle: 'Public Housing Wars',
    description: 'Clustered towers. Defensive strongholds. Hard to take, hard to hold.',
    type: 'permanent', playerRange: [4, 8], bestFor: 'medium', theme: 'overcast', size: 4,
    layout: buildHexLayout(4, [
      { type:'trap', weight:2 },{ type:'corner', weight:4 },{ type:'social', weight:2 },
      { type:'underground', weight:3 },{ type:'wild', weight:1 }
    ], [
      { name:'Tower A', size:3, type:'corner' },
      { name:'Tower B', size:3, type:'corner' },
      { name:'Tower C', size:3, type:'underground' },
      { name:'The Yard', size:2, type:'wild' },
      { name:'The Rec Room', size:2, type:'social' },
      { name:'Back Gate', size:2, type:'trap' },
      { name:'North Court', size:3, type:'underground' },
    ])
  },
  downtown: {
    id: 'downtown', name: 'Downtown', subtitle: 'City Center',
    description: 'High value districts everywhere. Everyone wants the same blocks.',
    type: 'permanent', playerRange: [2, 6], bestFor: 'quick', theme: 'midnight', size: 3,
    layout: buildHexLayout(3, [
      { type:'trap', weight:3 },{ type:'corner', weight:2 },{ type:'social', weight:4 },
      { type:'underground', weight:2 },{ type:'wild', weight:1 }
    ], [
      { name:'Financial District', size:3, type:'trap' },
      { name:'The Plaza', size:2, type:'social' },
      { name:'Media Row', size:3, type:'social' },
      { name:'The Underground', size:2, type:'underground' },
      { name:'The Ave', size:2, type:'corner' },
    ])
  },
};

const SEASONAL_MAPS = {
  winter_siege: {
    id: 'winter_siege', name: 'Winter Siege', subtitle: 'Season 1 — Part 1',
    description: 'Snow blankets the city. Movement costs increase. Defenders have the advantage.',
    type: 'seasonal', season: 1, part: 1, playerRange: [2, 8], bestFor: 'long',
    theme: 'blizzard', size: 4,
    modifiers: { movementCostMultiplier: 1.5, defenseBonus: 0.25, attackPenalty: 0.15, resourceYieldModifier: { trap: -0.2 } },
    layout: buildHexLayout(4, [
      { type:'corner', weight:4 },{ type:'trap', weight:2 },{ type:'social', weight:2 },
      { type:'underground', weight:3 },{ type:'wild', weight:1 }
    ], [
      { name:'Frozen Heights', size:3, type:'corner' },
      { name:'Ice Block', size:3, type:'underground' },
      { name:'The Shelter', size:2, type:'trap' },
      { name:'Cold Storage', size:3, type:'underground' },
      { name:'Snowfield', size:2, type:'wild' },
      { name:'Winter Market', size:2, type:'social' },
    ])
  },
  summer_heat: {
    id: 'summer_heat', name: 'Summer Heat', subtitle: 'Season 1 — Part 2',
    description: 'Festival season. Clout is worth double. Events trigger more often. The streets are alive.',
    type: 'seasonal', season: 1, part: 2, playerRange: [2, 8], bestFor: 'medium',
    theme: 'heat_wave', size: 4,
    modifiers: { cloutMultiplier: 2.0, eventFrequency: 1.5, cashYieldBonus: 0.1 },
    layout: buildHexLayout(4, [
      { type:'social', weight:4 },{ type:'trap', weight:3 },{ type:'corner', weight:2 },
      { type:'underground', weight:2 },{ type:'wild', weight:2 }
    ], [
      { name:'The Festival Grounds', size:4, type:'social' },
      { name:'The Pool Block', size:3, type:'wild' },
      { name:'Summer Market', size:3, type:'trap' },
      { name:'The Cook Out Spot', size:2, type:'social' },
      { name:'Night Market', size:3, type:'underground' },
      { name:'The Block Party', size:2, type:'corner' },
    ])
  },
};

const MAP_THEMES = {
  night_rain: { skyColor:'#050810', groundColor:'#0a0d14', roadColor:'#111318', fogColor:'rgba(30,40,80,0.3)', lightColor:'#4488ff', rainEnabled:true, ambientLight:0.15 },
  golden_hour: { skyColor:'#1a0e05', groundColor:'#120a03', roadColor:'#1a1005', fogColor:'rgba(80,40,10,0.2)', lightColor:'#ffaa44', rainEnabled:false, ambientLight:0.3 },
  neon_night: { skyColor:'#060408', groundColor:'#08050a', roadColor:'#0d080f', fogColor:'rgba(60,0,80,0.25)', lightColor:'#ff44ff', rainEnabled:false, ambientLight:0.1 },
  overcast: { skyColor:'#0a0c0e', groundColor:'#0c0e10', roadColor:'#111416', fogColor:'rgba(40,40,50,0.35)', lightColor:'#aabbcc', rainEnabled:true, ambientLight:0.2 },
  midnight: { skyColor:'#030305', groundColor:'#050507', roadColor:'#080810', fogColor:'rgba(10,10,30,0.4)', lightColor:'#ffffff', rainEnabled:false, ambientLight:0.08 },
  blizzard: { skyColor:'#0c1018', groundColor:'#10141c', roadColor:'#181c24', fogColor:'rgba(180,200,230,0.2)', lightColor:'#aaccff', rainEnabled:true, ambientLight:0.25 },
  heat_wave: { skyColor:'#1a0808', groundColor:'#160606', roadColor:'#1c0a08', fogColor:'rgba(255,80,40,0.2)', lightColor:'#ff8844', rainEnabled:false, ambientLight:0.4 },
  dawn: { skyColor:'#1a0a18', groundColor:'#10080d', roadColor:'#180a14', fogColor:'rgba(180,80,140,0.18)', lightColor:'#ff88aa', rainEnabled:false, ambientLight:0.22 },
  dusk: { skyColor:'#080820', groundColor:'#04041a', roadColor:'#08081f', fogColor:'rgba(40,20,90,0.3)', lightColor:'#6688ff', rainEnabled:false, ambientLight:0.15 },
};

module.exports = { PERMANENT_MAPS, SEASONAL_MAPS, MAP_THEMES, buildHexLayout };
