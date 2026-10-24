// Flag image URLs by lowercase alpha-2 code. Vite turns each SVG into a hashed asset URL.
const modules = import.meta.glob<string>('./flags/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const FLAGS: ReadonlyMap<string, string> = new Map(
  Object.entries(modules).map(([path, url]) => [path.replace(/^.*\/(\w+)\.svg$/, '$1'), url]),
);

export const flagUrl = (a2: string | undefined): string | undefined => {
  return a2 ? FLAGS.get(a2.toLowerCase()) : undefined;
};
