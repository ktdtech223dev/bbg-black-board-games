import { useEffect } from 'react';
import { useBBG } from '../../../store/useBBG';

export default function MapSelect() {
  const { mapsList, fetchMaps, selectedMap, setSelectedMap, setPage, isHost } = useBBG();

  useEffect(() => { fetchMaps(); }, [fetchMaps]);

  return (
    <div className="min-h-screen p-6 grain">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-3xl text-bbg-gold tracking-wider">PICK YOUR MAP</div>
          <div className="text-bbg-muted text-sm">{selectedMap ? `Selected: ${selectedMap.name}` : 'Choose where to wage war'}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage('lobby')}>← BACK</button>
          {isHost && selectedMap && <button className="btn btn-primary" onClick={() => setPage('gw_mode')}>NEXT ▶</button>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <Section title="PERMANENT MAPS" subtitle="Always available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(mapsList.permanent || []).map(m => (
              <MapCard key={m.id} map={m} selected={selectedMap?.id === m.id} onClick={() => setSelectedMap(m)} />
            ))}
          </div>
        </Section>

        <Section title="THIS WEEK · WEEKLY MAPS" subtitle="Procedurally generated · Same for all players">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(mapsList.weekly || []).map(m => (
              <MapCard key={m.id} map={m} selected={selectedMap?.id === m.id} onClick={() => setSelectedMap(m)} weekly />
            ))}
          </div>
        </Section>

        <Section title="SEASONAL MAPS" subtitle="Limited time · Special modifiers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(mapsList.seasonal || []).map(m => (
              <MapCard key={m.id} map={m} selected={selectedMap?.id === m.id} onClick={() => setSelectedMap(m)} seasonal />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section>
      <div className="mb-3">
        <div className="font-display text-xl text-bbg-gold tracking-wider">{title}</div>
        <div className="text-xs text-bbg-muted font-mono">{subtitle}</div>
      </div>
      {children}
    </section>
  );
}

function MapCard({ map, selected, onClick, weekly, seasonal }) {
  return (
    <button
      onClick={onClick}
      className={`bbg-card-base text-left p-4 transition-all hover:scale-[1.02] relative overflow-hidden ${selected ? 'bbg-glow-gold' : ''} ${seasonal ? 'shimmer' : ''}`}
      style={{
        borderColor: selected ? '#c8a84b' : (weekly ? '#c8a84b' : 'var(--bbg-border)'),
      }}
    >
      <div className="font-display text-xl tracking-wider">{map.name}</div>
      {map.subtitle && <div className="text-xs text-bbg-muted font-mono">{map.subtitle}</div>}
      <div className="text-xs text-bbg-text mt-2">{map.description}</div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {map.playerRange && (
          <span className="text-[10px] font-mono px-2 py-0.5 bg-bbg-raised rounded">
            {map.playerRange[0]}–{map.playerRange[1]} PLAYERS
          </span>
        )}
        {map.bestFor && (
          <span className="text-[10px] font-mono px-2 py-0.5 bg-bbg-raised rounded uppercase">
            {map.bestFor}
          </span>
        )}
        {weekly && <span className="text-[10px] font-mono px-2 py-0.5 bg-bbg-gold text-black rounded">WEEKLY</span>}
        {seasonal && <span className="text-[10px] font-mono px-2 py-0.5 bg-bbg-red text-white rounded">SEASONAL</span>}
      </div>

      {seasonal && map.modifiers && (
        <div className="mt-3 text-[10px] font-mono space-y-0.5 text-bbg-muted">
          {Object.entries(map.modifiers).map(([k, v]) => (
            <div key={k}>· {formatMod(k, v)}</div>
          ))}
          {map.daysRemaining != null && <div className="text-bbg-gold">· {map.daysRemaining} DAYS LEFT</div>}
        </div>
      )}

      {selected && <div className="absolute top-2 right-2 text-bbg-gold font-display text-xl">✓</div>}
    </button>
  );
}

function formatMod(k, v) {
  return `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v}`;
}
