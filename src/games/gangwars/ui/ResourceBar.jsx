import { CashIcon, MuscleIcon, CloutIcon, ConnectIcon } from '../graphics/resources';

export default function ResourceBar({ resources = {}, compact = false }) {
  const items = [
    { key: 'cash', Icon: CashIcon, color: '#22cc55' },
    { key: 'muscle', Icon: MuscleIcon, color: '#cc2222' },
    { key: 'clout', Icon: CloutIcon, color: '#cc88ff' },
    { key: 'connect', Icon: ConnectIcon, color: '#22aacc' },
  ];

  return (
    <div className={`flex ${compact ? 'gap-2' : 'gap-4'} flex-wrap`}>
      {items.map(({ key, Icon, color }) => (
        <div key={key} className="flex items-center gap-1.5 bg-bbg-raised px-2 py-1 rounded">
          <Icon size={compact ? 18 : 22} />
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {resources[key] || 0}
          </span>
        </div>
      ))}
    </div>
  );
}
