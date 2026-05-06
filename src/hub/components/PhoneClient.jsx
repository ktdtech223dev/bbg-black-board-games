import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';
import PlayerAvatar from './PlayerAvatar';
import PhoneView from '../../games/gangwars/pages/PhoneView';

export default function PhoneClient() {
  const { connect, joinLobby, lobbyState, gameState, playersList, fetchPlayers, setMyPlayer, myPlayer, currentPage } = useBBG();
  const [step, setStep] = useState('pick_player');

  const lobbyCode = window.location.pathname.split('/join/')[1]?.toUpperCase();

  useEffect(() => {
    connect();
    fetchPlayers();
  }, [connect, fetchPlayers]);

  function pickPlayer(p) {
    setMyPlayer(p);
    joinLobby(lobbyCode);
    setStep('lobby');
  }

  if (gameState && gameState.phase === 'playing') {
    return <PhoneView />;
  }

  if (step === 'pick_player') {
    return (
      <div className="min-h-screen p-4 flex flex-col">
        <div className="text-center mb-6">
          <div className="font-display text-3xl text-bbg-gold tracking-wider">BBG</div>
          <div className="text-xs text-bbg-muted font-mono">JOIN: {lobbyCode}</div>
        </div>

        <div className="font-display text-xl text-center mb-4">PICK YOUR CREW</div>

        <div className="grid grid-cols-2 gap-3">
          {playersList.map(p => {
            const taken = lobbyState?.players?.some(lp => lp.playerId === p.id);
            return (
              <button
                key={p.id}
                disabled={taken}
                onClick={() => pickPlayer(p)}
                className={`bbg-card-base p-4 flex flex-col items-center gap-2 ${taken ? 'opacity-30' : 'active:scale-95'}`}
                style={{ borderColor: p.color }}
              >
                <PlayerAvatar player={p} size={64} />
                <div className="font-display text-lg">{p.display_name}</div>
                {taken && <div className="text-xs text-bbg-red font-mono">TAKEN</div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="bbg-card-base p-4 mb-4 flex items-center gap-3">
        <PlayerAvatar player={myPlayer} size={48} />
        <div>
          <div className="font-display text-xl">{myPlayer?.display_name}</div>
          <div className="text-xs text-bbg-muted font-mono">CONNECTED</div>
        </div>
      </div>

      <div className="bbg-card-base p-4 flex-1 flex flex-col items-center justify-center">
        <div className="font-display text-2xl text-bbg-gold mb-2">WAITING FOR HOST</div>
        <div className="text-sm text-bbg-muted text-center">Host will start the game when ready</div>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          {lobbyState?.players?.map(p => (
            <div key={p.socketId} className="flex items-center gap-2 bg-bbg-raised px-3 py-2 rounded">
              <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <span className="text-sm">{p.displayName}</span>
              {p.isHost && <span className="ml-auto text-bbg-gold text-xs">★ HOST</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
