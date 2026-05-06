import { useState } from 'react';
import { useBBG } from '../../../store/useBBG';

const RES = ['cash', 'muscle', 'clout', 'connect'];

export default function TradeModal({ open, onClose }) {
  const { gameState, mySocketId, proposeTrade, privateState } = useBBG();
  const [target, setTarget] = useState(null);
  const [offer, setOffer] = useState({});
  const [request, setRequest] = useState({});

  if (!open) return null;

  const others = (gameState?.scores || []).filter(s => s.socketId !== mySocketId && !s.isEliminated);

  function adjust(map, setter, key, delta) {
    setter({ ...map, [key]: Math.max(0, (map[key] || 0) + delta) });
  }

  function submit() {
    if (!target) return;
    proposeTrade(target, offer, request);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bbg-card-base p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-2xl text-bbg-gold">PROPOSE TRADE</div>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        <div className="text-xs text-bbg-muted mb-2">TRADE WITH</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {others.map(p => (
            <button
              key={p.socketId}
              className={`px-3 py-1 rounded text-sm border ${target === p.socketId ? 'border-bbg-gold' : 'border-bbg-border opacity-60'}`}
              style={{ background: target === p.socketId ? `${p.color}33` : 'transparent' }}
              onClick={() => setTarget(p.socketId)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Section label="YOU GIVE" map={offer} setMap={setOffer} adjust={adjust} max={privateState?.myResources} />
          <Section label="YOU GET" map={request} setMap={setRequest} adjust={adjust} />
        </div>

        <button className="btn btn-primary w-full mt-4" disabled={!target} onClick={submit}>
          PROPOSE
        </button>
      </div>
    </div>
  );
}

function Section({ label, map, setMap, adjust, max }) {
  return (
    <div>
      <div className="text-xs text-bbg-muted mb-2">{label}</div>
      <div className="space-y-1">
        {RES.map(r => (
          <div key={r} className="flex items-center gap-1 bg-bbg-raised px-2 py-1 rounded">
            <span className="text-xs flex-1 uppercase">{r}</span>
            <button onClick={() => adjust(map, setMap, r, -10)} className="px-1.5">−</button>
            <span className="font-mono w-10 text-center text-sm">{map[r] || 0}</span>
            <button onClick={() => adjust(map, setMap, r, 10)} className="px-1.5" disabled={max && (map[r] || 0) >= (max[r] || 0)}>+</button>
          </div>
        ))}
      </div>
    </div>
  );
}
