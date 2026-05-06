const DOT = (cx, cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#fff" />;

const FACES = {
  1: [[16, 16]],
  2: [[8, 8], [24, 24]],
  3: [[7, 7], [16, 16], [25, 25]],
  4: [[8, 8], [24, 8], [8, 24], [24, 24]],
  5: [[8, 8], [24, 8], [16, 16], [8, 24], [24, 24]],
  6: [[8, 7], [24, 7], [8, 16], [24, 16], [8, 25], [24, 25]],
};

export default function DiceFace({ value = 1, size = 48, rolling = false }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={rolling ? 'dice-rolling' : ''}>
      <rect x="2" y="2" width="28" height="28" rx="5" fill="#1a1a26" stroke="#c8a84b" strokeWidth="1.2" />
      <rect x="3" y="3" width="26" height="26" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" />
      {(FACES[value] || []).map(([x, y]) => DOT(x, y))}
    </svg>
  );
}
