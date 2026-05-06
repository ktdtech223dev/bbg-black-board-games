import { useBBG } from '../../../store/useBBG';

export default function GameOver() {
  const { gameOverData, resetGame, setPage } = useBBG();
  const winner = gameOverData?.winner;
  const scores = gameOverData?.scores || [];
  const dur = gameOverData?.duration || 0;

  return (
    <div className="min-h-screen p-8 grain flex flex-col">
      <div className="text-center mb-8">
        <div className="text-6xl mb-2">👑</div>
        <div className="font-display text-5xl text-bbg-gold tracking-wider">{winner?.name || 'GAME OVER'}</div>
        <div className="text-bbg-muted font-mono text-sm mt-1">
          WINS · {Math.floor(dur / 60)}m {dur % 60}s
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto bbg-card-base p-6 mb-6">
        <div className="font-display text-xl text-bbg-gold mb-3 tracking-wider">FINAL SCOREBOARD</div>
        <div className="grid grid-cols-12 text-xs text-bbg-muted font-mono pb-2 border-b border-bbg-border">
          <span className="col-span-1">#</span>
          <span className="col-span-3">PLAYER</span>
          <span className="col-span-3">FACTION</span>
          <span className="col-span-3 text-right">WEALTH</span>
          <span className="col-span-2 text-right">TILES</span>
        </div>
        {scores.map((s, i) => (
          <div key={s.socketId} className="grid grid-cols-12 py-2 border-b border-bbg-border items-center text-sm">
            <span className="col-span-1 font-display text-2xl text-bbg-gold">{i + 1}</span>
            <span className="col-span-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="col-span-3 text-bbg-muted font-mono uppercase">{s.faction || '—'}</span>
            <span className="col-span-3 text-right font-mono text-bbg-gold">{s.totalWealth || 0}</span>
            <span className="col-span-2 text-right font-mono">{s.territories}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button className="btn btn-primary" onClick={() => { resetGame(); setPage('gw_map'); }}>↻ PLAY AGAIN</button>
        <button className="btn" onClick={() => { resetGame(); }}>⬅ MAIN MENU</button>
      </div>
    </div>
  );
}
