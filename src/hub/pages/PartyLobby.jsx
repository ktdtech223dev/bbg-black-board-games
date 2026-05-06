import { useBBG } from '../../store/useBBG';
import HostPanel from '../components/HostPanel';

export default function PartyLobby() {
  const { lobbyState, isHost, setPage, setWithBots, withBots } = useBBG();

  return (
    <div className="min-h-screen p-8 grain">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">PARTY LOBBY</div>
          <div className="text-bbg-muted text-sm">Waiting for crew to join</div>
        </div>
        <button className="btn" onClick={() => setPage('hub')}>← BACK TO HUB</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <HostPanel />

        <div className="bbg-card-base p-6">
          <div className="font-display text-xl text-bbg-gold tracking-wider mb-4">HOW IT WORKS</div>
          <ol className="space-y-3 text-sm">
            <li><span className="text-bbg-gold font-bold">1.</span> Players scan the QR code on their phones</li>
            <li><span className="text-bbg-gold font-bold">2.</span> Each player picks a crew member</li>
            <li><span className="text-bbg-gold font-bold">3.</span> Pick map and mode together</li>
            <li><span className="text-bbg-gold font-bold">4.</span> The board displays here on the TV</li>
            <li><span className="text-bbg-gold font-bold">5.</span> Players control from their phones</li>
          </ol>

          {isHost && (
            <div className="mt-6 pt-6 border-t border-bbg-border">
              <div className="font-display text-lg text-bbg-gold mb-3">SOLO MODE</div>
              <div className="text-xs text-bbg-muted mb-3">Add bots to play alone</div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setWithBots(n)}
                    className={`px-4 py-2 rounded font-mono text-sm ${
                      withBots === n ? 'bg-bbg-gold text-black' : 'bg-bbg-raised text-bbg-text'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="text-xs text-bbg-muted mt-2">
                {withBots === 0 ? 'No bots' : `${withBots} AI opponent${withBots > 1 ? 's' : ''}`}
              </div>
            </div>
          )}

          {isHost && (lobbyState?.players?.length >= 1) && (
            <button
              className="btn btn-primary w-full mt-6"
              onClick={() => setPage('gw_map')}
            >
              ▶ START · PICK MAP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
