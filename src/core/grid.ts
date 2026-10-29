import type { Question } from './round';
import { shuffle, type Rng } from './random';

// A point on the degree grid, in whole degrees.
export interface GridPoint {
  lat: number;
  lon: number;
}

// Grid spacing in degrees: wide enough to tap on a phone, fine enough to teach counting.
export const GRID_STEP = 30;

// Every grid point offered as a choice: latitudes -60..60 and longitudes -150..180.
export function gridPoints(step = GRID_STEP): GridPoint[] {
  const points: GridPoint[] = [];
  for (let lat = -60; lat <= 60; lat += step) {
    for (let lon = -180 + step; lon <= 180; lon += step) points.push({ lat, lon });
  }
  return points;
}

// Stable id of a grid point, e.g.
export function pointId({ lat, lon }: GridPoint): string {
  return `pt:${String(lat)}:${String(lon)}`;
}

export function parsePointId(id: string): GridPoint | undefined {
  const match = /^pt:(-?\d+):(-?\d+)$/.exec(id);
  if (!match) return undefined;
  return { lat: Number(match[1]), lon: Number(match[2]) };
}

// A round of "find the point" questions.
export function buildGridRound(rng: Rng, size = 10): Question[] {
  return shuffle(gridPoints(), rng).slice(0, size).map(gridQuestion);
}

// A "find the point" question.
export function gridQuestion(p: GridPoint): Question {
  const id = pointId(p);
  return { id: `coords:${id}`, mode: 'coords', itemId: id, promptId: id, acceptIds: [id] };
}

// Questions for the given point ids (the summary's "replay weak items").
export function gridReplay(ids: readonly string[], rng: Rng): Question[] {
  return shuffle(
    ids.flatMap((id) => {
      const p = parsePointId(id);
      return p ? [gridQuestion(p)] : [];
    }),
    rng,
  );
}
