export default function EmpirePiece({ color = '#fff', size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <rect x="6" y="6" width="20" height="22" fill="#0a0a14" stroke={color} strokeWidth="1.2" />
      {[0, 1, 2, 3].map(row => (
        [0, 1, 2].map(col => {
          const lit = (row + col) % 2 === 0;
          return (
            <rect key={`${row}-${col}`}
              x={9 + col * 5}
              y={9 + row * 4}
              width="3" height="2.5"
              fill={lit ? color : '#222'}
              opacity={lit ? 1 : 0.5}
            />
          );
        })
      ))}
      <rect x="13" y="22" width="6" height="6" fill="#080810" stroke={color} strokeWidth="0.5" />
      <polygon points="16,3 12,6 20,6" fill={color} />
      <line x1="16" y1="3" x2="16" y2="0" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}
