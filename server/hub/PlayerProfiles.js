const { db } = require('../database');

function getPlayer(id) {
  return db.prepare('SELECT * FROM players WHERE id=?').get(id);
}

function getAllPlayers() {
  return db.prepare('SELECT * FROM players ORDER BY id').all();
}

function getPlayerStats(id) {
  return db.prepare(`
    SELECT p.*, phs.total_games, phs.total_wins, phs.season_points,
           gs.games_played, gs.games_won, gs.territories_claimed,
           gs.players_eliminated, gs.cards_played, gs.successful_attacks,
           gs.failed_attacks, gs.faction_wins, gs.highest_score
    FROM players p
    LEFT JOIN player_hub_stats phs ON phs.player_id = p.id
    LEFT JOIN gangwars_stats gs ON gs.player_id = p.id
    WHERE p.id = ?
  `).get(id);
}

function recordGameResult({ winnerId, players, mode, mapName, gameId, durationSec }) {
  const stmt = db.prepare(`
    INSERT INTO game_history (game_id, game_type, mode, map_name, winner_id, players_json, duration_sec)
    VALUES (?, 'gangwars', ?, ?, ?, ?, ?)
  `);
  stmt.run(gameId, mode, mapName, winnerId, JSON.stringify(players), durationSec || 0);

  players.forEach(p => {
    if (!p.playerId) return;
    db.prepare('UPDATE player_hub_stats SET total_games = total_games + 1 WHERE player_id = ?').run(p.playerId);
    db.prepare('UPDATE gangwars_stats SET games_played = games_played + 1 WHERE player_id = ?').run(p.playerId);
    if (p.playerId === winnerId) {
      db.prepare('UPDATE player_hub_stats SET total_wins = total_wins + 1, season_points = season_points + 10 WHERE player_id = ?').run(p.playerId);
      db.prepare('UPDATE gangwars_stats SET games_won = games_won + 1 WHERE player_id = ?').run(p.playerId);
      const season = db.prepare('SELECT id, number FROM seasons WHERE is_active=1').get();
      if (season) {
        db.prepare(`
          INSERT INTO gangwars_season_standings (season, player_id, wins, points, games, best_faction)
          VALUES (?, ?, 1, 10, 1, ?)
          ON CONFLICT(season, player_id) DO UPDATE SET
            wins = wins + 1, points = points + 10, games = games + 1
        `).run(season.number, p.playerId, p.faction || null);
      }
    }
  });
}

module.exports = { getPlayer, getAllPlayers, getPlayerStats, recordGameResult };
