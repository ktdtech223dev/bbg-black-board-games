import { useEffect } from 'react';
import { useBBG } from '../../store/useBBG';
import FactionSelect from './pages/FactionSelect';
import MapSelect from './pages/MapSelect';
import ModeSelect from './pages/ModeSelect';
import GameBoard from './pages/GameBoard';
import GameOver from './pages/GameOver';
import PhoneView from './pages/PhoneView';

export default function GangWars() {
  const { currentPage, setPage, lobbyState, fetchFactions } = useBBG();

  useEffect(() => { fetchFactions(); }, [fetchFactions]);

  if (currentPage === 'gw_lobby_choice') {
    return <LobbyChoice />;
  }
  if (currentPage === 'gw_map') return <MapSelect />;
  if (currentPage === 'gw_mode') return <ModeSelect />;
  if (currentPage === 'gw_faction') return <FactionSelect />;
  if (currentPage === 'gw_board') return <GameBoard />;
  if (currentPage === 'gw_over') return <GameOver />;
  if (currentPage === 'gw_phone') return <PhoneView />;

  return null;
}

function LobbyChoice() {
  const { setPage, createLobby, myPlayer } = useBBG();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 grain">
      <div className="font-display text-6xl text-bbg-gold tracking-[0.15em] mb-2">GANG WARS</div>
      <div className="text-bbg-muted mb-8 font-mono text-sm">CHOOSE YOUR LOBBY TYPE</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <button
          onClick={() => { createLobby('party'); setPage('lobby'); }}
          disabled={!myPlayer}
          className="bbg-card-base p-8 text-left hover:scale-105 transition disabled:opacity-50"
        >
          <div className="font-display text-3xl text-bbg-gold tracking-wider">🏠 PARTY</div>
          <div className="text-sm text-bbg-muted mt-2">Couch multiplayer</div>
          <div className="font-mono text-xs text-bbg-muted mt-4">
            • TV/PC shows the board<br/>
            • Players join via phone QR<br/>
            • Add bots for solo play
          </div>
        </button>

        <button
          onClick={() => { createLobby('online'); setPage('online'); }}
          disabled={!myPlayer}
          className="bbg-card-base p-8 text-left hover:scale-105 transition disabled:opacity-50"
        >
          <div className="font-display text-3xl text-bbg-gold tracking-wider">🌐 ONLINE</div>
          <div className="text-sm text-bbg-muted mt-2">Remote multiplayer</div>
          <div className="font-mono text-xs text-bbg-muted mt-4">
            • Hosted on Railway<br/>
            • Share lobby code with crew<br/>
            • Cross-device play
          </div>
        </button>
      </div>

      <button className="btn mt-8" onClick={() => setPage('hub')}>← BACK TO HUB</button>
      {!myPlayer && <div className="text-bbg-red text-xs mt-4">Pick a crew member first!</div>}
    </div>
  );
}
