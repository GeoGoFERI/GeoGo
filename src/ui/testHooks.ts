export type TestHooks = { seed?: number; round?: string[] };

export const readTestHooks = (search: string): TestHooks => {
  const params = new URLSearchParams(search);
  const hooks: TestHooks = {};
  const seed = Number(params.get('seed'));
  if (params.has('seed') && Number.isFinite(seed)) hooks.seed = seed;
  const round = params.get('round');
  if (round) hooks.round = round.split(',').filter(Boolean);
  return hooks;
};
