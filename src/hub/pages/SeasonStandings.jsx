import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';

export default function SeasonStandings() {
  const { setPage, hubData } = useBBG();
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    fetch(`/api/gangwars/standings?season=${hubData?.season?.number || 1}`)
      .then(r => r.json()).then(setStandings).catch(() => setStandings([]));
  }, [hubData]);

  return (
    <div className="min-h-screen p-8 grain">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">STANDINGS</div>
          <div className="text-bbg-muted font-mono text-sm">{hubData?.season?.name || 'Season 1'}</div>
        </div>
        <button className="btn" onClick={() => setPage('hub')}>← BACK</button>
      </div>

      <div className="bbg-card-base p-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-12 text-xs text-bbg-muted font-mono pb-2 border-b border-bbg-border">
          <span className="col-span-1">#</span>
          <span className="col-span-5">PLAYER</span>
          <span className="col-span-2 text-right">GAMES</span>
          <span className="col-span-2 text-right">WINS</span>
          <span className="col-span-2 text-right">POINTS</span>
        </div>
        {standings.length === 0 && (
          <div className="text-center text-bbg-muted py-8 font-mono">No games played yet this season.</div>
        )}
        {standings.map((s, i) => (
          <div key={s.player_id} className="grid grid-cols-12 py-3 border-b border-bbg-border items-center">
            <span className="col-span-1 font-display text-2xl text-bbg-gold">{i + 1}</span>
            <span className="col-span-5 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="font-display">{s.display_name}</span>
            </span>
            <span className="col-span-2 text-right font-mono">{s.games}</span>
            <span className="col-span-2 text-right font-mono text-bbg-green">{s.wins}</span>
            <span className="col-span-2 text-right font-mono text-bbg-gold">{s.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
