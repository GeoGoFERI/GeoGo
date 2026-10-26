// a lon/lat position
export type Position = [number, number];

// clips a ring to one side of a meridian (Sutherland-Hodgman against a half-plane)
export const clipRingAtMeridian = (
  ring: readonly Position[],
  lon: number,
  keepWest: boolean,
): { ring: Position[]; crossings: number[] } => {
  const inside = (p: Position): boolean => (keepWest ? p[0] <= lon : p[0] >= lon);
  const out: Position[] = [];
  const crossings: number[] = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i];
    const b = ring[i + 1];
    if (!a || !b) continue;
    const aIn = inside(a);
    const bIn = inside(b);
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      const t = (lon - a[0]) / (b[0] - a[0]);
      const lat = a[1] + t * (b[1] - a[1]);
      out.push([lon, lat]);
      crossings.push(lat);
    }
  }
  const first = out[0];
  if (first) out.push(first);
  return { ring: out.length >= 4 ? out : [], crossings };
};

// keeps only the parts of lines west (or east) of a meridian
export const clipLinesAtMeridian = (
  lines: readonly (readonly Position[])[],
  lon: number,
  keepWest: boolean,
): Position[][] => {
  const inside = (p: Position): boolean => (keepWest ? p[0] <= lon : p[0] >= lon);
  const out: Position[][] = [];
  for (const line of lines) {
    let current: Position[] = [];
    for (const p of line) {
      if (inside(p)) current.push(p);
      else if (current.length > 0) {
        if (current.length > 1) out.push(current);
        current = [];
      }
    }
    if (current.length > 1) out.push(current);
  }
  return out;
};
