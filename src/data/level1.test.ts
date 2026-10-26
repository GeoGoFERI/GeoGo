import { describe, expect, it } from 'vitest';
import { geoContains } from 'd3-geo';
import { buildLevel1 } from './level1';
import { testSources } from './testSources';
import { itemSchema } from '../core/item';

const level1 = buildLevel1(testSources.topology, testSources.marine);
const where = (lon: number, lat: number): string[] =>
  [...level1.features.entries()].filter(([, f]) => geoContains(f, [lon, lat])).map(([id]) => id);

describe('Level 1 geometry', () => {
  it('has the 7 continents and 5 oceans from the curriculum, all valid', () => {
    expect(level1.items.filter((i) => i.kind === 'continent')).toHaveLength(7);
    expect(level1.items.filter((i) => i.kind === 'ocean')).toHaveLength(5);
    for (const item of level1.items) expect(itemSchema.safeParse(item).success).toBe(true);
  });

  it('puts cities on the right continent, including both sides of the Ural and the Bosphorus', () => {
    expect(where(14.5, 46.05)).toEqual(['continent-evropa']); // Ljubljana
    expect(where(37.6, 55.75)).toEqual(['continent-evropa']); // Moskva
    expect(where(82.9, 55.0)).toEqual(['continent-azija']); // Novosibirsk
    expect(where(172, 66.5)).toEqual(['continent-azija']); // Chukotka, by the antimeridian cut
    expect(where(-175, 66.5)).toEqual(['continent-azija']); // Chukotka, past the antimeridian
    expect(where(28.95, 41.03)).toEqual(['continent-evropa']); // Istanbul, European side
    expect(where(32.85, 39.93)).toEqual(['continent-azija']); // Ankara
    expect(where(31.24, 30.04)).toEqual(['continent-afrika']); // Kairo
    expect(where(-79.52, 8.98)).toEqual(['continent-severna-amerika']); // Panama
    expect(where(-74.07, 4.71)).toEqual(['continent-juzna-amerika']); // Bogota
    expect(where(-52.3, 4.9)).toEqual(['continent-juzna-amerika']); // French Guiana
    expect(where(149.1, -35.3)).toEqual(['continent-avstralija']); // Canberra
    expect(where(0, -80)).toEqual(['continent-antarktika']);
  });

  it('puts open sea in the right ocean', () => {
    expect(where(-30, 30)).toEqual(['ocean-atlantski']);
    expect(where(-150, 0)).toEqual(['ocean-tihi']);
    expect(where(80, -20)).toEqual(['ocean-indijski']);
    expect(where(0, 88)).toEqual(['ocean-arkticni']);
    expect(where(0, -66)).toEqual(['ocean-juzni']);
    // The Sargasso Sea patch is no longer a hole in the Atlantic.
    expect(where(-60, 28)).toEqual(['ocean-atlantski']);
  });
});
