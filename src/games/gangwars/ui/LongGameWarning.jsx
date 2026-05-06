import { useBBG } from '../../../store/useBBG';

export default function LongGameWarning({ open, onClose, onConfirm }) {
  const { lobbyState, mySocketId } = useBBG();
  if (!open) return null;

  const players = lobbyState?.players || [];
  const allConfirmed = players.every(p => p.longGameConfirmed);
  const meConfirmed = players.find(p => p.socketId === mySocketId)?.longGameConfirmed;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6">
      <div className="bbg-card-base bbg-glow-red max-w-lg w-full p-8 border-bbg-red">
        <div className="text-bbg-red text-6xl text-center mb-4">⚠</div>
        <div className="font-display text-3xl text-center text-bbg-red tracking-wider mb-2">LONG GAME WARNING</div>
        <p className="text-sm text-bbg-text mt-4 leading-relaxed">
          Estimated <span className="text-bbg-gold font-bold">1+ hours</span> but could go longer
          depending on your crew. This game <span className="text-bbg-red font-bold">DOES NOT SAVE</span>.
          You must finish in one session.
        </p>
        <p className="text-sm text-bbg-muted mt-3">Every player must confirm individually before the host can start.</p>

        <div className="my-6 space-y-2">
          {players.map(p => (
            <div key={p.socketId} className="flex items-center gap-2 bg-bbg-raised px-3 py-2 rounded">
              <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              <span className="text-sm flex-1">{p.displayName}</span>
              <span className={`text-xs font-mono ${p.longGameConfirmed ? 'text-bbg-green' : 'text-bbg-muted'}`}>
                {p.longGameConfirmed ? '✓ CONFIRMED' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="btn flex-1" onClick={onClose}>BACK</button>
          {!meConfirmed && (
            <button className="btn btn-danger flex-1" onClick={onConfirm}>I CONFIRM</button>
          )}
          {allConfirmed && (
            <button className="btn btn-primary flex-1" onClick={() => onConfirm(true)}>START GAME</button>
          )}
        </div>
      </div>
    </div>
  );
}
