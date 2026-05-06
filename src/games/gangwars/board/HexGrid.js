export const HEX_SIZE = 52;

export function hexToPixel(q, r, size = HEX_SIZE) {
  const x = size * (3 / 2 * q);
  const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

export function pixelToHex(x, y, size = HEX_SIZE) {
  const q = (2 / 3 * x) / size;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
  return cubeRound(q, -q - r, r);
}

export function cubeRound(q, s, r) {
  let rq = Math.round(q);
  let rs = Math.round(s);
  let rr = Math.round(r);
  const dq = Math.abs(rq - q);
  const ds = Math.abs(rs - s);
  const dr = Math.abs(rr - r);
  if (dq > ds && dq > dr) rq = -rs - rr;
  else if (ds > dr) rs = -rq - rr;
  else rr = -rq - rs;
  return { q: rq, r: rr };
}

export function hexCorners(cx, cy, size = HEX_SIZE) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i);
    corners.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle)
    });
  }
  return corners;
}

export function hexNeighbors(q, r) {
  return [
    { q: q + 1, r: r - 1 }, { q: q + 1, r: r },
    { q: q, r: r + 1 }, { q: q - 1, r: r + 1 },
    { q: q - 1, r: r }, { q: q, r: r - 1 }
  ];
}
