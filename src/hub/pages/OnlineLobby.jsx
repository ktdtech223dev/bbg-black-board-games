import { useState } from 'react';
import { useBBG } from '../../store/useBBG';

export default function OnlineLobby() {
  const { lobbyState, isHost, setPage, joinLobby } = useBBG();
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center grain">
      <div className="font-display text-4xl text-bbg-gold tracking-wider mb-2">ONLINE LOBBY</div>
      <div className="text-bbg-muted mb-8">Hosted multiplayer</div>

      {lobbyState ? (
        <div className="bbg-card-base p-6 max-w-md w-full">
          <div className="text-xs text-bbg-muted font-mono">JOIN CODE</div>
          <div className="font-display text-5xl text-bbg-gold tracking-[0.2em] mb-6">{lobbyState.joinCode}</div>

          <div className="text-xs text-bbg-muted font-mono mb-2">PLAYERS ({lobbyState.players?.length || 0})</div>
          <div className="space-y-2">
            {lobbyState.players?.map(p => (
              <div key={p.socketId} className="flex items-center gap-2 bg-bbg-raised px-3 py-2 rounded">
                <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                <span className="text-sm">{p.displayName}</span>
                {p.isHost && <span className="ml-auto text-bbg-gold text-xs">★ HOST</span>}
              </div>
            ))}
          </div>

          {isHost && (lobbyState.players?.length || 0) >= 2 && (
            <button className="btn btn-primary w-full mt-6" onClick={() => setPage('gw_map')}>
              ▶ START GAME
            </button>
          )}
        </div>
      ) : (
        <div className="bbg-card-base p-6 max-w-md w-full">
          <div className="font-display text-xl mb-3">JOIN A GAME</div>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="LOBBY CODE"
            maxLength={6}
            className="w-full p-3 bg-bbg-deep border border-bbg-border rounded font-mono text-2xl tracking-widest text-center text-bbg-gold"
          />
          <button
            className="btn btn-primary w-full mt-3"
            disabled={code.length < 4}
            onClick={() => joinLobby(code)}
          >
            JOIN
          </button>
        </div>
      )}

      <button className="btn mt-8" onClick={() => setPage('hub')}>← BACK</button>
    </div>
  );
}
