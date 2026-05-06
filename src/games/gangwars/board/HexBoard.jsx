import { useRef, useEffect, useCallback } from 'react';
import { hexToPixel, hexCorners, pixelToHex, HEX_SIZE } from './HexGrid';
import { DISTRICT_COLORS, TIER_COLORS, TIER_LABELS } from './HexTile';

export default function HexBoard({
  board, players, currentPlayer, selectedTile, onTileClick,
  mySocketId, width = 800, height = 600,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const getCenterOffset = useCallback(() => ({ x: width / 2, y: height / 2 }), [width, height]);

  const drawBoard = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas || !board) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.4);
    grad.addColorStop(0, 'rgba(20,20,40,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const { x: ox, y: oy } = getCenterOffset();

    if (!board.tileMap) return;

    Object.values(board.tileMap).forEach(tile => {
      const { x, y } = hexToPixel(tile.q, tile.r);
      const cx = ox + x;
      const cy = oy + y;
      const corners = hexCorners(cx, cy);

      const dc = DISTRICT_COLORS[tile.type] || DISTRICT_COLORS.wild;
      const isSelected = selectedTile === tile.key;
      const isMyTile = tile.owner === mySocketId;

      const pulse = isSelected ? Math.sin(timestamp * 0.004) * 0.3 + 0.7 : 1;

      ctx.beginPath();
      corners.forEach((c, i) => i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y));
      ctx.closePath();
      ctx.fillStyle = dc.base;
      ctx.fill();

      if (tile.tier > 0) {
        ctx.fillStyle = TIER_COLORS[tile.tier];
        ctx.fill();
      }

      if (tile.owner && players) {
        const owner = players.find(p => p.socketId === tile.owner);
        if (owner) {
          ctx.fillStyle = (owner.color || '#888') + '33';
          ctx.fill();
        }
      }

      const borderAlpha = isSelected ? pulse : (isMyTile ? 0.95 : 0.6);
      const hex = (a) => Math.floor(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = dc.border + hex(borderAlpha);
      ctx.lineWidth = isSelected ? 3.5 : (isMyTile ? 2.5 : 1.4);
      ctx.stroke();

      if (tile.token) {
        const isHot = tile.token === 6 || tile.token === 8;
        ctx.fillStyle = isHot ? '#ff4422' : '#ffffff';
        ctx.font = `bold ${isHot ? 14 : 12}px Rajdhani`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.token, cx, cy - 8);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px Rajdhani';
      ctx.fillText(dc.label, cx, cy + 6);

      if (tile.tier > 0) {
        ctx.fillStyle = isMyTile ? '#ffffff' : '#aaaaaa';
        ctx.font = 'bold 11px "Bebas Neue"';
        ctx.fillText(TIER_LABELS[tile.tier], cx, cy + 20);
      }

      if (tile.owner && players) {
        const owner = players.find(p => p.socketId === tile.owner);
        if (owner) {
          ctx.beginPath();
          ctx.arc(cx + 22, cy - 22, 6, 0, Math.PI * 2);
          ctx.fillStyle = owner.color || '#888';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (tile.neighborhood?.name) {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.font = '7px Rajdhani';
        ctx.fillText(tile.neighborhood.name.split(' ')[0], cx, cy + 32);
      }
    });

    if (selectedTile && board.tileMap) {
      const tile = board.tileMap[selectedTile];
      if (tile) {
        const { x, y } = hexToPixel(tile.q, tile.r);
        const cx = ox + x, cy = oy + y;
        ctx.beginPath();
        ctx.arc(cx, cy, HEX_SIZE - 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.4 + Math.sin(timestamp * 0.005) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    animRef.current = requestAnimationFrame(drawBoard);
  }, [board, players, selectedTile, mySocketId, width, height, getCenterOffset]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(drawBoard);
    return () => animRef.current && cancelAnimationFrame(animRef.current);
  }, [drawBoard]);

  const handleClick = useCallback((e) => {
    if (!board?.tileMap) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { x: ox, y: oy } = getCenterOffset();
    const { q, r } = pixelToHex(mx - ox, my - oy);
    const key = `${q},${r}`;
    const tile = board.tileMap[key];
    if (tile) onTileClick?.(tile);
  }, [board, getCenterOffset, onTileClick]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ cursor: 'pointer', borderRadius: '8px', display: 'block' }}
    />
  );
}
