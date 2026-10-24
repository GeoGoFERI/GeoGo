import { describe, expect, it } from 'vitest';
import world from 'world-atlas/countries-50m.json';
import type { WorldTopology } from '../map/world';
import { computeGeoFacts } from './geoFacts';
import { EUROPE_ROWS } from './countriesEurope';
import { PLACE_BY_GEO } from './places';

const topology = world as unknown as WorldTopology;
const facts = computeGeoFacts(topology);
const names = (geo: string): string[] =>
  (facts.get(geo)?.neighbours ?? []).map((g) => PLACE_BY_GEO.get(g)?.nameSl ?? g).sort();

describe('generated country facts', () => {
  it('finds Slovenia’s four neighbours and its coast', () => {
    expect(names('705')).toEqual(['Avstrija', 'Hrvaška', 'Italija', 'Madžarska']);
    expect(facts.get('705')?.coastal).toBe(true);
  });

  it('matches the known landlocked countries of Europe', () => {
    const landlocked = EUROPE_ROWS.filter((r) => !facts.get(r.geo)?.coastal)
      .map((r) => r.nameSl)
      .sort((a, b) => a.localeCompare(b, 'sl'));
    expect(landlocked).toEqual(
      [
        'Andora',
        'Avstrija',
        'Belorusija',
        'Češka',
        'Kosovo',
        'Lihtenštajn',
        'Luksemburg',
        'Madžarska',
        'Moldavija',
        'San Marino',
        'Severna Makedonija',
        'Slovaška',
        'Srbija',
        'Švica',
        'Vatikan',
      ].sort((a, b) => a.localeCompare(b, 'sl')),
    );
  });

  it('ignores overseas parts of European countries', () => {
    expect(names('250')).not.toContain('Brazilija');
    expect(names('250')).toContain('Španija');
  });

  it('keeps exclaves: Russia borders Poland and Lithuania through Kaliningrad', () => {
    expect(names('643')).toEqual(expect.arrayContaining(['Poljska', 'Litva', 'Finska']));
  });

  it('treats merged parts as one country', () => {
    expect(names('196')).toEqual([]);
    expect(facts.get('196')?.coastal).toBe(true);
  });
});
