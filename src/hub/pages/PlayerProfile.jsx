import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';
import PlayerAvatar from '../components/PlayerAvatar';

export default function PlayerProfile() {
  const { setPage, myPlayer, playersList } = useBBG();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!myPlayer) return;
    fetch(`/api/players/${myPlayer.id}/stats`).then(r => r.json()).then(setStats);
  }, [myPlayer]);

  return (
    <div className="min-h-screen p-8 grain">
      <div className="flex items-center justify-between mb-6">
        <div className="font-display text-3xl text-bbg-gold tracking-wider">MY PROFILE</div>
        <button className="btn" onClick={() => setPage('hub')}>← BACK</button>
      </div>

      {!myPlayer && (
        <div className="bbg-card-base p-6 max-w-3xl mx-auto">
          <div className="font-display text-xl mb-4">SELECT A CREW MEMBER</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {playersList.map(p => (
              <button
                key={p.id}
                onClick={() => useBBG.getState().setMyPlayer(p)}
                className="bbg-card-base p-4 flex flex-col items-center gap-2 hover:scale-105"
              >
                <PlayerAvatar player={p} size={56} />
                <div className="font-display">{p.display_name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {myPlayer && stats && (
        <div className="max-w-4xl mx-auto">
          <div className="bbg-card-base p-6 flex items-center gap-6 mb-6">
            <PlayerAvatar player={myPlayer} size={96} ring />
            <div>
              <div className="font-display text-4xl">{myPlayer.display_name}</div>
              <div className="text-bbg-muted font-mono text-sm">@{myPlayer.username}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="GAMES" value={stats.total_games || 0} />
            <StatCard label="WINS" value={stats.total_wins || 0} accent="#22aa44" />
            <StatCard label="SEASON PTS" value={stats.season_points || 0} accent="#c8a84b" />
            <StatCard label="TERRITORIES" value={stats.territories_claimed || 0} />
            <StatCard label="ELIMINATIONS" value={stats.players_eliminated || 0} accent="#cc2222" />
            <StatCard label="CARDS PLAYED" value={stats.cards_played || 0} />
            <StatCard label="ATTACKS WON" value={stats.successful_attacks || 0} accent="#22aa44" />
            <StatCard label="HIGH SCORE" value={stats.highest_score || 0} accent="#c8a84b" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = '#e8e4d8' }) {
  return (
    <div className="bbg-card-base p-4 text-center">
      <div className="text-xs text-bbg-muted font-mono">{label}</div>
      <div className="font-display text-3xl" style={{ color: accent }}>{value}</div>
    </div>
  );
}
