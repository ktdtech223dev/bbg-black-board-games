const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(process.env.HOME || process.env.USERPROFILE || '.', 'Documents', 'BBG');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'bbg.db');
const db = new Database(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS players (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    color       TEXT NOT NULL,
    avatar      TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS player_hub_stats (
    player_id     INTEGER PRIMARY KEY REFERENCES players(id),
    total_games   INTEGER DEFAULT 0,
    total_wins    INTEGER DEFAULT 0,
    total_losses  INTEGER DEFAULT 0,
    current_season INTEGER DEFAULT 1,
    season_points INTEGER DEFAULT 0,
    season_wins   INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS seasons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    number      INTEGER NOT NULL,
    name        TEXT NOT NULL,
    theme       TEXT NOT NULL,
    started_at  DATETIME NOT NULL,
    ends_at     DATETIME NOT NULL,
    is_active   INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS weekly_maps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    week_seed   TEXT NOT NULL,
    week_start  DATETIME NOT NULL,
    map_a_data  TEXT NOT NULL,
    map_b_data  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id     TEXT NOT NULL,
    game_type   TEXT NOT NULL,
    mode        TEXT NOT NULL,
    map_name    TEXT NOT NULL,
    winner_id   INTEGER REFERENCES players(id),
    players_json TEXT NOT NULL,
    duration_sec INTEGER,
    played_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gangwars_stats (
    player_id       INTEGER PRIMARY KEY REFERENCES players(id),
    games_played    INTEGER DEFAULT 0,
    games_won       INTEGER DEFAULT 0,
    territories_claimed INTEGER DEFAULT 0,
    players_eliminated  INTEGER DEFAULT 0,
    times_eliminated    INTEGER DEFAULT 0,
    cards_played    INTEGER DEFAULT 0,
    successful_attacks  INTEGER DEFAULT 0,
    failed_attacks  INTEGER DEFAULT 0,
    faction_wins    TEXT DEFAULT '{}',
    highest_score   INTEGER DEFAULT 0,
    longest_game_sec INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gangwars_season_standings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    season      INTEGER DEFAULT 1,
    player_id   INTEGER REFERENCES players(id),
    wins        INTEGER DEFAULT 0,
    points      INTEGER DEFAULT 0,
    games       INTEGER DEFAULT 0,
    best_faction TEXT,
    UNIQUE(season, player_id)
  );

  CREATE INDEX IF NOT EXISTS idx_game_history_type ON game_history(game_type);
  CREATE INDEX IF NOT EXISTS idx_gangwars_season ON gangwars_season_standings(season);
`);

function seedCrew() {
  const count = db.prepare('SELECT COUNT(*) as c FROM players').get().c;
  if (count > 0) return;

  const ins = db.prepare(`
    INSERT INTO players (username, display_name, color, avatar)
    VALUES (?, ?, ?, ?)
  `);

  const crew = [
    ['keshawn', "Ke'Shawn", '#FF69B4', 'K'],
    ['sean',    'Sean',     '#2E8B57', 'S'],
    ['amari',   'Amari',    '#FFD700', 'A'],
    ['dart',    'Dart',     '#722F37', 'D'],
    ['tyheim',  'Tyheim',   '#FF6B35', 'T'],
    ['arisa',   'Arisa',    '#9B59B6', 'R'],
  ];

  crew.forEach(c => {
    const r = ins.run(...c);
    db.prepare('INSERT INTO player_hub_stats (player_id) VALUES (?)').run(r.lastInsertRowid);
    db.prepare('INSERT INTO gangwars_stats (player_id) VALUES (?)').run(r.lastInsertRowid);
  });
}

function seedSeason() {
  const active = db.prepare('SELECT COUNT(*) as c FROM seasons WHERE is_active=1').get().c;
  if (active > 0) return;

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 90);

  db.prepare(`
    INSERT INTO seasons (number, name, theme, started_at, ends_at)
    VALUES (1, 'Season 1: The Come Up', 'winter', ?, ?)
  `).run(now.toISOString(), end.toISOString());
}

seedCrew();
seedSeason();

module.exports = { db };
