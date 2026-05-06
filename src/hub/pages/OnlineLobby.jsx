import { useEffect } from 'react';
import { useBBG } from '../../store/useBBG';
import PlayerAvatar from '../components/PlayerAvatar';

export default function OnlineLobby() {
  const {
    lobbyState, isHost, mySocketId, myPlayer, playersList,
    fetchPlayers, setPage, joinOnline, leaveOnline,
    setMyPlayer, toggleReady, withBots, setWithBots,
  } = useBBG();

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  // Auto-rejoin if state was lost (sock reconnect, page refresh)
  useEffect(() => {
    if (myPlayer && !lobbyState) joinOnline();
  }, [myPlayer, lobbyState, joinOnline]);

  const players = lobbyState?.players || [];
  const me = players.find(p => p.socketId === mySocketId);
  const playerCount = players.length;
  const readyCount = players.filter(p => p.isReady).length;
  const allReady = playerCount >= 2 && players.every(p => p.isReady);
  const takenIds = new Set(players.map(p => p.playerId));

  function pickCrew(p) {
    setMyPlayer(p);
    leaveOnline();
    // The auto-rejoin effect above will pick the new identity up
  }

  function leaveAndBack() {
    leaveOnline();
    setPage('hub');
  }

  function startGame() {
    setPage('gw_map');
  }

  return (
    <div className="min-h-screen p-6 grain">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">🌐 ONLINE LOBBY</div>
          <div className="text-bbg-muted text-sm font-mono">SHARED ROOM · NO CODES NEEDED</div>
        </div>
        <button className="btn" onClick={leaveAndBack}>← LEAVE & BACK</button>
      </header>

      {/* Active room */}
      <div className="bbg-card-base p-4 mb-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="font-display text-xl text-bbg-gold tracking-wider">
            PLAYERS IN ROOM ({playerCount})
          </div>
          <div className="text-xs font-mono text-bbg-muted">
            {readyCount} / {playerCount} READY
          </div>
        </div>

        {playerCount === 0 ? (
          <div className="text-sm text-bbg-muted py-4 text-center">
            Pick a crew member below to enter the room.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <div
                key={p.socketId}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: `${p.color}33`, border: `1px solid ${p.color}` }}
              >
                <PlayerAvatar player={{ color: p.color, avatar: p.avatar, display_name: p.displayName }} size={28} />
                <span className="font-display tracking-wider">{p.displayName}</span>
                {p.isHost && <span title="Host" className="text-bbg-gold">👑</span>}
                {p.isReady ? <span title="Ready" className="text-bbg-green">✓</span> : <span title="Not ready" className="text-bbg-muted">⏳</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crew picker */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="font-display text-lg text-bbg-gold tracking-wider mb-2">PICK YOUR CREW</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {playersList.map(p => {
            const occupiedByOther = takenIds.has(p.id) && me?.playerId !== p.id;
            const isMine = me?.playerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => !occupiedByOther && pickCrew(p)}
                disabled={occupiedByOther}
                className={`bbg-card-base p-3 flex flex-col items-center gap-2 transition ${
                  occupiedByOther ? 'opacity-30' : 'hover:scale-105'
                } ${isMine ? 'bbg-glow-gold' : ''}`}
                style={{
                  borderColor: isMine ? p.color : 'var(--bbg-border)',
                  background: isMine ? `${p.color}22` : undefined,
                }}
              >
                <PlayerAvatar player={p} size={56} ring={isMine} />
                <div className="font-display tracking-wider text-sm">{p.display_name}</div>
                {occupiedByOther && <div className="text-[10px] font-mono text-bbg-red">IN ROOM</div>}
                {isMine && <div className="text-[10px] font-mono text-bbg-gold">YOU</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ready / Host controls */}
      <div className="max-w-4xl mx-auto bbg-card-base p-4 flex flex-col md:flex-row items-center gap-4">
        {me ? (
          <>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl">YOU ARE: <span style={{ color: me.color }}>{me.displayName}</span></div>
              <div className="text-xs font-mono text-bbg-muted">
                {me.isHost ? '👑 HOST · You start the game when everyone is ready'
                  : isHost ? '⏳ Promoted to host'
                  : '⏳ Waiting for host to start'}
              </div>
            </div>

            <button
              onClick={() => toggleReady(!me.isReady)}
              className={`btn text-lg px-6 py-3 ${me.isReady ? 'btn-primary' : ''}`}
              style={!me.isReady ? { background: '#22aa44', color: '#fff' } : {}}
            >
              {me.isReady ? '✓ READY' : '⏳ READY UP'}
            </button>

            {isHost && (
              <button
                onClick={startGame}
                disabled={!allReady}
                className="btn btn-primary text-lg px-6 py-3 disabled:opacity-40"
                title={!allReady ? 'Need 2+ players, all ready' : 'Pick map'}
              >
                ▶ START · PICK MAP
              </button>
            )}
          </>
        ) : (
          <div className="text-sm text-bbg-muted">Pick a crew member above to join the room.</div>
        )}
      </div>

      {/* Solo bot fill (host only, IB-style optional) */}
      {isHost && me && (
        <div className="max-w-4xl mx-auto mt-4 bbg-card-base p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display text-sm text-bbg-gold tracking-wider">FILL WITH BOTS:</span>
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setWithBots(n)}
                className={`px-3 py-1 rounded font-mono text-sm ${
                  withBots === n ? 'bg-bbg-gold text-black' : 'bg-bbg-raised text-bbg-text'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-xs text-bbg-muted">
              {withBots === 0 ? 'No bots — wait for real players' : `${withBots} AI when game starts`}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-3 text-center text-[10px] font-mono text-bbg-muted">
        ROOM · {lobbyState?.id || 'NGAMES'} · {lobbyState?.state?.toUpperCase() || 'WAITING'}
      </div>
    </div>
  );
}
