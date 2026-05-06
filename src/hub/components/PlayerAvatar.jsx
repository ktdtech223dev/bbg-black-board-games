export default function PlayerAvatar({ player, size = 40, ring = false }) {
  if (!player) return null;
  const dim = `${size}px`;
  return (
    <div
      className="flex items-center justify-center font-display rounded-full border-2"
      style={{
        width: dim,
        height: dim,
        background: player.color,
        color: '#0a0a0a',
        fontSize: size * 0.5,
        borderColor: ring ? '#fff' : 'rgba(255,255,255,0.2)',
        boxShadow: ring ? `0 0 14px ${player.color}` : 'none',
      }}
    >
      {player.avatar || player.display_name?.[0] || '?'}
    </div>
  );
}
