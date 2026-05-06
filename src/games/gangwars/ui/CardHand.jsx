import { useBBG } from '../../../store/useBBG';
import CardFront from '../graphics/cards/CardFront';

export default function CardHand({ hand = [], compact = false, isMyTurn }) {
  const { playCard } = useBBG();

  if (hand.length === 0) {
    return <div className="text-xs text-bbg-muted font-mono py-4 text-center">No cards</div>;
  }

  return (
    <div className={`flex gap-2 overflow-x-auto py-2 ${compact ? '' : 'flex-wrap'}`}>
      {hand.map(card => (
        <div key={card.instanceId} className="flex-shrink-0 flex flex-col items-center gap-1">
          <CardFront card={card} width={compact ? 110 : 140} height={compact ? 154 : 196} />
          <button
            className="btn btn-primary text-xs px-3 py-1"
            disabled={!isMyTurn}
            onClick={() => playCard(card.instanceId, {})}
          >
            PLAY
          </button>
        </div>
      ))}
    </div>
  );
}
