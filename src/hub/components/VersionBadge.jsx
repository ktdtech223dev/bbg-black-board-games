import { useBBG } from '../../store/useBBG';

export default function VersionBadge() {
  const { hubData } = useBBG();
  return (
    <div className="font-mono text-xs text-bbg-muted bg-bbg-panel border border-bbg-border px-2 py-1 rounded">
      v{hubData?.version || '1.0.0'}
    </div>
  );
}
