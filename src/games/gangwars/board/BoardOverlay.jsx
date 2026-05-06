export default function BoardOverlay({ event }) {
  if (!event) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="bbg-card-base px-6 py-3 bg-bbg-card/90 border-bbg-gold animate-pulse">
        <div className="font-display text-2xl text-bbg-gold tracking-wider">{event.title}</div>
        {event.subtitle && <div className="text-sm text-bbg-text">{event.subtitle}</div>}
      </div>
    </div>
  );
}
