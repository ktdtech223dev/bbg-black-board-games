import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';
import QRCode from './QRCode';

export default function HostPanel() {
  const { lobbyState, hubData } = useBBG();
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (!lobbyState?.joinCode) return;
    const ip = hubData?.localIP || window.location.hostname;
    const port = hubData?.port || 3847;
    setJoinUrl(`http://${ip}:${port}/join/${lobbyState.joinCode}`);
  }, [lobbyState, hubData]);

  if (!lobbyState) return null;

  return (
    <div className="bbg-card-base p-6 flex flex-col items-center gap-4">
      <div className="font-display text-2xl text-bbg-gold tracking-wider">PARTY MODE</div>
      <div className="text-sm text-bbg-muted">Players join from their phones</div>

      <div className="bg-white p-4 rounded-lg">
        {joinUrl && <QRCode value={joinUrl} size={220} />}
      </div>

      <div className="text-center">
        <div className="text-xs text-bbg-muted font-mono">JOIN CODE</div>
        <div className="font-display text-5xl tracking-[0.2em] text-bbg-gold">{lobbyState.joinCode}</div>
      </div>

      <div className="text-xs text-bbg-muted font-mono break-all text-center">
        {joinUrl}
      </div>

      <div className="w-full mt-2 border-t border-bbg-border pt-3">
        <div className="text-xs text-bbg-muted font-mono mb-2">CONNECTED ({lobbyState.players?.length || 0})</div>
        <div className="flex flex-wrap gap-2">
          {lobbyState.players?.map(p => (
            <div key={p.socketId} className="flex items-center gap-2 bg-bbg-raised px-3 py-1 rounded">
              <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <span className="text-sm">{p.displayName}</span>
              {p.isHost && <span className="text-bbg-gold text-xs">★</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
