import { useEffect, useState } from 'react';
import { radio, RADIO_GENRES } from '../audio/Radio';
import { sfx } from '../audio/SFX';

export default function RadioWidget({ position = 'bottom-left' }) {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const [activeGenre, setActiveGenre] = useState(RADIO_GENRES[0]?.genre || null);

  useEffect(() => radio.subscribe(() => force(n => n + 1)), []);
  useEffect(() => sfx.subscribe(() => force(n => n + 1)), []);

  const current = radio.currentStation;
  const playing = radio.isPlaying();
  const status = radio.status;

  const positions = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-right': 'top-4 right-4',
  };

  return (
    <div className={`fixed ${positions[position]} z-30`}>
      <button
        onClick={() => { setOpen(o => !o); sfx.click(); }}
        className="bbg-card-base px-3 py-2 flex items-center gap-2 hover:scale-105 transition shadow-lg"
        style={{ borderColor: playing ? 'var(--bbg-gold)' : 'var(--bbg-border)' }}
      >
        <span className="text-2xl">📻</span>
        <div className="text-left">
          <div className="font-display text-sm tracking-wider leading-tight">RADIO</div>
          <div className="text-[10px] text-bbg-muted font-mono leading-tight max-w-[140px] truncate">
            {current ? RADIO_GENRES.flatMap(g => g.stations).find(s => s.id === current)?.name : 'OFF'}
          </div>
        </div>
        {playing && (
          <span
            className="ml-1 inline-block w-2 h-2 rounded-full pulse-glow"
            style={{ background: status === 'loading' ? '#c8a84b' : '#22cc55', color: status === 'loading' ? '#c8a84b' : '#22cc55' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute bbg-card-base p-3 w-[340px] max-h-[480px] overflow-hidden flex flex-col shadow-2xl"
          style={{
            bottom: position.startsWith('bottom') ? '56px' : 'auto',
            top: position.startsWith('top') ? '56px' : 'auto',
            left: position.endsWith('left') ? '0' : 'auto',
            right: position.endsWith('right') ? '0' : 'auto',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-display text-bbg-gold tracking-wider">📻 STATIONS</div>
            <button onClick={() => setOpen(false)} className="text-bbg-muted hover:text-bbg-text text-lg">✕</button>
          </div>

          <div className="flex items-center gap-2 mb-3 bg-bbg-raised p-2 rounded">
            <button
              onClick={() => { radio.toggleMute(); sfx.click(); }}
              className="text-lg w-8"
              title="Mute radio"
            >
              {radio.muted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0" max="1" step="0.02"
              value={radio.volume}
              onChange={e => radio.setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-bbg-gold"
            />
            <span className="font-mono text-xs w-8 text-right">{Math.round(radio.volume * 100)}</span>
          </div>

          <div className="flex items-center gap-2 mb-3 bg-bbg-raised p-2 rounded">
            <span className="text-xs font-mono text-bbg-muted w-12">SFX</span>
            <button
              onClick={() => { sfx.toggleMute(); sfx.click(); }}
              className="text-lg w-8"
              title="Mute SFX"
            >
              {sfx.muted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0" max="1" step="0.02"
              value={sfx.volume}
              onChange={e => sfx.setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-bbg-gold"
            />
            <span className="font-mono text-xs w-8 text-right">{Math.round(sfx.volume * 100)}</span>
          </div>

          <button
            onClick={() => { radio.stop(); sfx.click(); }}
            className={`btn w-full mb-2 text-sm ${!current ? 'btn-primary' : ''}`}
          >
            ⏻ TURN OFF
          </button>

          <div className="flex flex-wrap gap-1 mb-2 border-b border-bbg-border pb-2">
            {RADIO_GENRES.map(({ genre }) => (
              <button
                key={genre}
                onClick={() => { setActiveGenre(genre); sfx.hover(); }}
                className={`text-[10px] font-mono px-2 py-1 rounded ${
                  activeGenre === genre ? 'bg-bbg-gold text-black' : 'bg-bbg-raised text-bbg-muted hover:text-bbg-text'
                }`}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 space-y-1">
            {RADIO_GENRES.find(g => g.genre === activeGenre)?.stations.map(s => (
              <button
                key={s.id}
                onClick={() => { radio.play(s.id); sfx.click(); }}
                className={`w-full text-left p-2 rounded transition ${
                  current === s.id ? 'bg-bbg-gold text-black' : 'bg-bbg-raised hover:bg-bbg-hover'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="font-display tracking-wider text-sm flex-1">{s.name}</div>
                  {current === s.id && (
                    <span className="text-[10px] font-mono">
                      {status === 'playing' ? '▶ PLAYING' : status === 'loading' ? '⏳ LOADING' : status === 'error' ? '✗ ERROR' : ''}
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-70 mt-0.5">{s.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-bbg-border text-[9px] font-mono text-bbg-muted text-center">
            STREAMS · SOMAFM.COM · LISTENER-SUPPORTED
          </div>
        </div>
      )}
    </div>
  );
}
