import { useBBG } from '../../store/useBBG';

const COLORS = {
  info:    { bg: 'var(--bbg-card)',   bd: 'var(--bbg-border)', tx: 'var(--bbg-text)' },
  success: { bg: '#0c2a18',           bd: '#1a6b3a',           tx: '#9ce0b4' },
  gain:    { bg: '#0c1f2a',           bd: '#22aacc',           tx: '#88d8ff' },
  error:   { bg: '#2a0a0a',           bd: '#cc2222',           tx: '#ff9999' },
  event:   { bg: '#1a0a2a',           bd: '#cc88ff',           tx: '#e6c8ff' },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useBBG();
  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto px-4 py-2 rounded-md flex items-center gap-2 shadow-2xl font-ui text-sm transition-all hover:scale-[1.02] animate-[fadeInDown_0.18s_ease-out]"
            style={{
              background: c.bg,
              border: `1px solid ${c.bd}`,
              color: c.tx,
              boxShadow: `0 4px 24px ${c.bd}55, inset 0 0 12px ${c.bd}11`,
              minWidth: 240,
              maxWidth: 480,
            }}
          >
            {t.icon && <span className="text-lg">{t.icon}</span>}
            <span className="flex-1 text-left">{t.msg}</span>
          </button>
        );
      })}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
