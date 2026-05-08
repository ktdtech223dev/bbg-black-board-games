import { useBBG } from '../../../store/useBBG';
import CardFront from '../graphics/cards/CardFront';

export default function CardHand({ hand = [], compact = false, isMyTurn }) {
  const { initiateCard, privateState, gameState, mySocketId } = useBBG();
  const myScore = gameState?.scores?.find(s => s.socketId === mySocketId);
  const myResources = myScore?.resources || privateState?.myResources || {};

  if (hand.length === 0) {
    return <div className="text-xs text-bbg-muted font-mono py-4 text-center">No cards in hand</div>;
  }

  return (
    <div className={`flex gap-2 overflow-x-auto py-2 ${compact ? '' : 'flex-wrap'}`}>
      {hand.map(card => {
        const canAfford = Object.entries(card.cost || {}).every(
          ([r, v]) => (myResources[r] || 0) >= v
        );
        return (
          <div key={card.instanceId} className="flex-shrink-0 flex flex-col items-center gap-1">
            <CardFront card={card} width={compact ? 110 : 140} height={compact ? 154 : 196} />
            <button
              className="btn btn-primary text-xs px-3 py-1 disabled:opacity-40"
              disabled={!isMyTurn || !canAfford}
              onClick={() => initiateCard(card)}
              title={!canAfford ? 'Cannot afford' : !isMyTurn ? 'Not your turn' : 'Play card'}
            >
              {!canAfford ? '✗ COST' : 'PLAY'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
