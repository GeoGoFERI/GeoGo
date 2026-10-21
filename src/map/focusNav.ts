// Arrow-key direction on the map.
export type Direction = 'up' | 'down' | 'left' | 'right';

const VECTORS: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

// Picks the shape to focus next when an arrow key is pressed: the nearest anchor that lies in the
// pressed direction, preferring ones close to the straight line over ones off to the side.
export function nextInDirection(
  anchors: ReadonlyMap<string, [number, number]>,
  currentId: string,
  direction: Direction,
): string | undefined {
  const from = anchors.get(currentId);
  if (!from) return undefined;
  const [dx, dy] = VECTORS[direction];
  let best: string | undefined;
  let bestScore = Infinity;
  for (const [id, [x, y]] of anchors) {
    if (id === currentId) continue;
    const vx = x - from[0];
    const vy = y - from[1];
    const along = vx * dx + vy * dy;
    if (along <= 0) continue;
    const across = Math.abs(vx * dy - vy * dx);
    // Sideways distance counts double, so "right" means mostly right.
    const score = along + 2 * across;
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

// The anchor closest to a point, used to pick where keyboard focus enters the map.
export function nearestAnchor(
  anchors: ReadonlyMap<string, [number, number]>,
  point: [number, number],
): string | undefined {
  let best: string | undefined;
  let bestDist = Infinity;
  for (const [id, [x, y]] of anchors) {
    const d = (x - point[0]) ** 2 + (y - point[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}
