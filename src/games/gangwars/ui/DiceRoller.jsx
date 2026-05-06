import { useEffect, useState } from 'react';
import DiceFace from '../graphics/dice/DiceFace';

export default function DiceRoller({ d1, d2, isMyTurn, onRoll, phase }) {
  const [rolling, setRolling] = useState(false);
  const [shown1, setShown1] = useState(d1 || 1);
  const [shown2, setShown2] = useState(d2 || 1);

  useEffect(() => {
    if (d1 && d2) {
      setShown1(d1);
      setShown2(d2);
      setRolling(false);
    }
  }, [d1, d2]);

  function handleRoll() {
    setRolling(true);
    let i = 0;
    const interval = setInterval(() => {
      setShown1(Math.ceil(Math.random() * 6));
      setShown2(Math.ceil(Math.random() * 6));
      i++;
      if (i > 8) clearInterval(interval);
    }, 60);
    onRoll?.();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <DiceFace value={shown1} size={56} rolling={rolling} />
        <DiceFace value={shown2} size={56} rolling={rolling} />
      </div>
      {d1 && d2 && (
        <div className="font-display text-3xl text-bbg-gold">{d1 + d2}</div>
      )}
      {isMyTurn && phase === 'roll' && (
        <button className="btn btn-primary text-lg px-6" onClick={handleRoll} disabled={rolling}>
          🎲 ROLL DICE
        </button>
      )}
    </div>
  );
}
