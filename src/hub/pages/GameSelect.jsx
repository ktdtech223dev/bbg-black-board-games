import { useBBG } from '../../store/useBBG';

export default function GameSelect() {
  const { setPage, createLobby, myPlayer } = useBBG();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="font-display text-5xl text-bbg-gold tracking-wider mb-4">GANG WARS</h1>
      <p className="text-bbg-muted mb-8">Choose your battlefield</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <button
          className="bbg-card-base p-6 text-left hover:scale-105 transition"
          onClick={() => { createLobby('party'); setPage('lobby'); }}
          disabled={!myPlayer}
        >
          <div className="font-display text-3xl text-bbg-gold tracking-wider">PARTY MODE</div>
          <div className="text-sm text-bbg-muted mt-2">Couch multiplayer · TV + Phones</div>
          <div className="font-mono text-xs text-bbg-muted mt-4">
            Host on this machine · Players join via QR code
          </div>
        </button>

        <button
          className="bbg-card-base p-6 text-left hover:scale-105 transition"
          onClick={() => { createLobby('online'); setPage('online'); }}
          disabled={!myPlayer}
        >
          <div className="font-display text-3xl text-bbg-gold tracking-wider">ONLINE MODE</div>
          <div className="text-sm text-bbg-muted mt-2">Remote multiplayer · Anywhere</div>
          <div className="font-mono text-xs text-bbg-muted mt-4">
            Hosted on Railway · Share lobby code with crew
          </div>
        </button>
      </div>

      <button className="btn mt-8" onClick={() => setPage('hub')}>← BACK</button>
      {!myPlayer && <div className="text-bbg-red text-xs mt-4">Pick a crew member first!</div>}
    </div>
  );
}
