import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';

export default function WeeklyMapsPage() {
  const { setPage, hubData } = useBBG();
  const [maps, setMaps] = useState({ weekly: [] });

  useEffect(() => {
    fetch('/api/gangwars/maps').then(r => r.json()).then(setMaps).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen p-8 grain">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">WEEKLY MAPS</div>
          <div className="text-bbg-muted font-mono text-sm">{hubData?.weekly?.weekSeed || '—'}</div>
        </div>
        <button className="btn" onClick={() => setPage('hub')}>← BACK</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {(maps.weekly || []).map(m => (
          <div key={m.id} className="bbg-card-base p-6">
            <div className="font-display text-2xl text-bbg-gold tracking-wider">{m.name}</div>
            <div className="text-bbg-muted font-mono text-xs">{m.subtitle}</div>
            <div className="mt-2 text-sm">{m.description || 'Procedurally generated this week.'}</div>
            <div className="mt-3 text-[10px] font-mono text-bbg-muted uppercase">Theme: {m.theme}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
