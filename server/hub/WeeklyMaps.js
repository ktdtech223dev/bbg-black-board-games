const { db } = require('../database');

function getWeekSeed() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay()) / 7);
  return `${year}-W${week}`;
}

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h >>> 0) / 4294967296);
  };
}

const DISTRICT_TYPES = ['trap', 'corner', 'social', 'underground', 'wild'];
const NUMBER_TOKENS = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

function generateHexMap(seed, mapIndex) {
  const rng = seededRandom(seed + mapIndex);
  const size = 4;

  const tiles = [];
  const tokens = [...NUMBER_TOKENS];
  for (let i = tokens.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }

  let tokenIdx = 0;

  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size);
    const r2 = Math.min(size, -q + size);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      const isDesert = q === 0 && r === 0 && s === 0;
      const typeIdx = Math.floor(rng() * DISTRICT_TYPES.length);
      const type = isDesert ? 'wild' : DISTRICT_TYPES[typeIdx];

      tiles.push({
        q, r, s,
        key: `${q},${r}`,
        type,
        token: isDesert ? null : tokens[tokenIdx++ % tokens.length],
        baseYield: getBaseYield(type),
        owner: null,
        tier: 0,
        hasPort: rng() < 0.12,
        portType: DISTRICT_TYPES[Math.floor(rng() * DISTRICT_TYPES.length)],
      });
    }
  }

  const neighborhoods = generateNeighborhoods(tiles, rng);

  const tileMap = Object.fromEntries(tiles.map(t => [t.key, t]));

  return {
    seed: seed + mapIndex,
    size,
    tiles,
    tileMap,
    neighborhoods,
    generatedAt: new Date().toISOString(),
    mapType: 'weekly',
    theme: mapIndex === 0 ? 'dawn' : 'dusk',
    name: mapIndex === 0
      ? `Week ${seed} — Dawn District`
      : `Week ${seed} — Dusk District`,
  };
}

function getBaseYield(type) {
  return { trap: 100, corner: 80, social: 90, underground: 85, wild: 120 }[type] || 80;
}

function generateNeighborhoods(tiles, rng) {
  const neighborhoods = [];
  const assigned = new Set();
  const named = ['The Heights','Southside','Eastside','Uptown','The Bottoms','West End','Midtown','The Flats','North Block'];
  let nameIdx = 0;

  tiles.forEach(tile => {
    if (assigned.has(tile.key) || tile.type === 'wild') return;
    const hood = {
      id: neighborhoods.length,
      name: named[nameIdx++ % named.length],
      tiles: [tile.key],
      type: tile.type,
    };

    const neighbors = getNeighbors(tile);
    neighbors.forEach(n => {
      const key = `${n.q},${n.r}`;
      const neighbor = tiles.find(t => t.q === n.q && t.r === n.r);
      if (neighbor && !assigned.has(key) && neighbor.type === tile.type && rng() < 0.55) {
        hood.tiles.push(key);
        assigned.add(key);
        neighbor.neighborhood = { id: hood.id, name: hood.name, type: hood.type };
      }
    });

    assigned.add(tile.key);
    tile.neighborhood = { id: hood.id, name: hood.name, type: hood.type };
    neighborhoods.push(hood);
  });

  return neighborhoods;
}

function getNeighbors({ q, r, s }) {
  return [
    { q: q + 1, r: r - 1, s }, { q: q + 1, r: r, s: s - 1 },
    { q: q,     r: r + 1, s: s - 1 }, { q: q - 1, r: r + 1, s },
    { q: q - 1, r: r,     s: s + 1 }, { q: q,     r: r - 1, s: s + 1 },
  ];
}

function getCurrentWeeklyMaps() {
  const seed = getWeekSeed();
  const existing = db.prepare('SELECT * FROM weekly_maps WHERE week_seed = ?').get(seed);

  if (existing) {
    return {
      mapA: JSON.parse(existing.map_a_data),
      mapB: JSON.parse(existing.map_b_data),
      weekSeed: seed,
    };
  }

  const mapA = generateHexMap(seed, 0);
  const mapB = generateHexMap(seed, 1);
  const monday = getThisMonday();

  db.prepare(`
    INSERT INTO weekly_maps (week_seed, week_start, map_a_data, map_b_data)
    VALUES (?, ?, ?, ?)
  `).run(seed, monday.toISOString(), JSON.stringify(mapA), JSON.stringify(mapB));

  return { mapA, mapB, weekSeed: seed };
}

function getThisMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = { getCurrentWeeklyMaps, generateHexMap, getWeekSeed };
