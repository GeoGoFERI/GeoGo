import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';

// A country polygon from world-atlas with a stable key.
export type CountryFeature = Feature<Geometry, { name: string }> & { id: string };

export type WorldTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Stable key for a world-atlas country.
export function countryKey(id: string | number | undefined, name: string): string {
  if (id !== undefined && id !== '') return String(id);
  return `x-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`;
}

// Converts the topology's country objects into GeoJSON features with stable keys.
export function countryFeatures(topology: WorldTopology): CountryFeature[] {
  const collection = feature(topology, topology.objects.countries);
  return collection.features.map((f) => ({
    ...f,
    id: countryKey(f.id, f.properties.name),
  }));
}

// The 50m world, loaded as its own chunk so the start screen paints first.
export async function loadWorld50(): Promise<WorldTopology> {
  const module = await import('world-atlas/countries-50m.json');
  return module.default as unknown as WorldTopology;
}
