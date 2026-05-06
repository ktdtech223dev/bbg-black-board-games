const { db } = require('../../database');

function getCurrentSeasonNum() {
  const row = db.prepare('SELECT number FROM seasons WHERE is_active=1 LIMIT 1').get();
  return row?.number || 1;
}

function awardSeasonPoints(playerId, points) {
  if (!playerId) return;
  const seasonNum = getCurrentSeasonNum();
  db.prepare(`
    INSERT INTO gangwars_season_standings (season, player_id, wins, points, games)
    VALUES (?, ?, 0, ?, 0)
    ON CONFLICT(season, player_id) DO UPDATE SET points = points + ?
  `).run(seasonNum, playerId, points, points);
}

module.exports = { getCurrentSeasonNum, awardSeasonPoints };
