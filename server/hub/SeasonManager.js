const { db } = require('../database');

function getActiveSeason() {
  return db.prepare('SELECT * FROM seasons WHERE is_active=1 LIMIT 1').get();
}

function daysRemaining() {
  const season = getActiveSeason();
  if (!season) return 0;
  const ends = new Date(season.ends_at);
  const ms = ends - new Date();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function rollSeasonIfExpired() {
  const season = getActiveSeason();
  if (!season) return;
  if (new Date(season.ends_at) < new Date()) {
    db.prepare('UPDATE seasons SET is_active = 0 WHERE id = ?').run(season.id);
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 90);
    db.prepare(`
      INSERT INTO seasons (number, name, theme, started_at, ends_at)
      VALUES (?, ?, 'rotation', ?, ?)
    `).run(season.number + 1, `Season ${season.number + 1}`, now.toISOString(), end.toISOString());
  }
}

function getStandings(seasonNum) {
  return db.prepare(`
    SELECT gs.*, p.display_name, p.color, p.avatar
    FROM gangwars_season_standings gs
    JOIN players p ON p.id = gs.player_id
    WHERE gs.season = ?
    ORDER BY gs.wins DESC, gs.points DESC
  `).all(seasonNum);
}

module.exports = { getActiveSeason, daysRemaining, rollSeasonIfExpired, getStandings };
