import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import type { GeometryCollection, GeometryObject, Topology } from 'topojson-specification';

// A country polygon from world-atlas with a stable key.
export type CountryFeature = Feature<Geometry, { name: string }> & { id: string };

export type WorldTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Name-based key for features without a usable ISO id: "N.
export function nameKey(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `x-${slug}`;
}

// Stable keys for the topology's country objects, in order.
export function countryKeys(topology: WorldTopology): string[] {
  const used = new Set<string>();
  return topology.objects.countries.geometries.map((g) => {
    const id = g.id === undefined || g.id === '' ? undefined : String(g.id);
    const key =
      id && !used.has(id)
        ? id
        : nameKey((g.properties as { name?: string } | undefined)?.name ?? 'unknown');
    used.add(key);
    return key;
  });
}

// A single topology object as a GeoJSON feature (our objects are never collections).
export function objectFeature(topology: WorldTopology, object: GeometryObject): Feature<Geometry> {
  const result = feature(topology, object);
  if (result.type === 'FeatureCollection') throw new Error('Unexpected geometry collection');
  return result;
}

// Topology geometry objects by key, for merging and adjacency.
export function countryGeometries(topology: WorldTopology): Map<string, GeometryObject> {
  const keys = countryKeys(topology);
  const out = new Map<string, GeometryObject>();
  topology.objects.countries.geometries.forEach((g, i) => {
    const key = keys[i];
    if (key) out.set(key, g);
  });
  return out;
}

// Converts the topology's country objects into GeoJSON features with stable keys.
export function countryFeatures(topology: WorldTopology): CountryFeature[] {
  const keys = countryKeys(topology);
  const collection = feature(topology, topology.objects.countries);
  return collection.features.map((f, i) => ({ ...f, id: keys[i] ?? nameKey(f.properties.name) }));
}

// The 50m world, loaded as its own chunk so the start screen paints first.
export async function loadWorld50(): Promise<WorldTopology> {
  const module = await import('world-atlas/countries-50m.json');
  return module.default as unknown as WorldTopology;
}
