import { useEffect } from 'react';
import { useBBG } from '../../store/useBBG';
import GameCard from '../components/GameCard';
import VersionBadge from '../components/VersionBadge';

export default function HubMenu() {
  const { hubData, fetchHubStatus, setPage, fetchPlayers, playersList, myPlayer, setMyPlayer } = useBBG();

  useEffect(() => {
    fetchHubStatus();
    fetchPlayers();
    const t = setInterval(fetchHubStatus, 60000);
    return () => clearInterval(t);
  }, [fetchHubStatus, fetchPlayers]);

  const games = hubData?.games || [
    { id:'gangwars', name:'Gang Wars', status:'live', players:'2-8', subtitle:'Strategy · Territory Control' },
    { id:'generational_wealth', name:'Generational Wealth', status:'coming_soon', subtitle:'Life Simulator' },
    { id:'cap_detector', name:'Cap Detector', status:'coming_soon', subtitle:'Deception Game' },
  ];

  return (
    <div className="min-h-screen flex flex-col grain">
      <header className="px-8 py-6 flex items-center justify-between border-b border-bbg-border">
        <div>
          <h1 className="font-display text-5xl text-bbg-gold tracking-[0.15em] leading-none">
            BBG
          </h1>
          <div className="text-bbg-muted text-xs font-mono mt-1 tracking-widest">
            BLACK BOARD GAMES · N GAMES PARTY PLATFORM
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hubData?.season && (
            <div className="bbg-card-base px-3 py-2">
              <div className="text-xs font-mono text-bbg-muted">SEASON {hubData.season.number}</div>
              <div className="font-display text-sm text-bbg-gold">{hubData.season.name}</div>
              <div className="text-xs text-bbg-muted font-mono">
                {hubData.season.daysRemaining ?? 90} DAYS LEFT
              </div>
            </div>
          )}
          <VersionBadge />
        </div>
      </header>

      <div className="px-8 py-3 border-b border-bbg-border bg-bbg-deep flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-bbg-muted">PLAYING AS:</span>
        <div className="flex gap-2">
          {playersList.map(p => (
            <button
              key={p.id}
              onClick={() => setMyPlayer(p)}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition border ${
                myPlayer?.id === p.id ? 'border-bbg-gold' : 'border-bbg-border opacity-60'
              }`}
              style={{ background: myPlayer?.id === p.id ? `${p.color}33` : 'transparent' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.display_name}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-8 py-12 flex flex-col items-center">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {games.map(g => <GameCard key={g.id} game={g} />)}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn" onClick={() => setPage('standings')}>
              📊 SEASON STANDINGS
            </button>
            <button className="btn" onClick={() => setPage('profile')}>
              👤 MY PROFILE
            </button>
            <button className="btn" onClick={() => setPage('weekly_maps')}>
              📅 WEEKLY MAPS
            </button>
          </div>

          {hubData?.weekly && (
            <div className="mt-10 bbg-card-base p-4 max-w-3xl mx-auto">
              <div className="font-display text-bbg-gold text-lg tracking-wider">THIS WEEK · {hubData.weekly.weekSeed}</div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="text-sm">{hubData.weekly.mapAName}</div>
                <div className="text-sm">{hubData.weekly.mapBName}</div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-8 py-4 border-t border-bbg-border text-xs text-bbg-muted font-mono flex items-center justify-between">
        <span>BBG · {hubData?.localIP || 'localhost'}</span>
        <span>{games.filter(g => g.status === 'live').length} GAMES LIVE</span>
      </footer>
    </div>
  );
}
