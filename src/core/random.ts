export type Rng = () => number;

export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function weightedSample<T>(
  entries: readonly T[],
  weight: (entry: T) => number,
  n: number,
  rng: Rng,
): T[] {
  const left = entries
    .map((entry) => ({ entry, w: Math.max(weight(entry), 0) }))
    .filter((e) => e.w > 0);
  const picked: T[] = [];
  while (picked.length < n && left.length > 0) {
    const total = left.reduce((sum, e) => sum + e.w, 0);
    let r = rng() * total;
    let index = left.length - 1;
    for (let i = 0; i < left.length; i += 1) {
      r -= left[i]?.w ?? 0;
      if (r < 0) {
        index = i;
        break;
      }
    }
    const [chosen] = left.splice(index, 1);
    if (chosen) picked.push(chosen.entry);
  }
  return picked;
}

export function shuffle<T>(entries: readonly T[], rng: Rng): T[] {
  const out = [...entries];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}
