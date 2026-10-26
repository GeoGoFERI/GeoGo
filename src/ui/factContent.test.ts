import { describe, expect, it } from 'vitest';
import { testSources } from '../data/testSources';
import { buildGameData } from '../data/gameData';
import { factContent } from './factContent';

const data = buildGameData(testSources);
const item = (id: string) => {
  const found = data.itemById.get(id);
  if (!found) throw new Error(id);
  return found;
};

describe('factContent', () => {
  it('gives Slovenia its coast and neighbours in label-and-value form', () => {
    const c = factContent(item('country-si'), data);
    expect(c.title).toBe('Slovenija');
    expect(c.flagUrl).toBeDefined();
    expect(c.lines).toEqual([
      { label: 'Obmorska država' },
      { label: 'Sosednje države', value: 'Avstrija, Hrvaška, Italija, Madžarska' },
    ]);
  });

  it('marks landlocked countries and island countries', () => {
    expect(factContent(item('country-at'), data).lines[0]).toEqual({ label: 'Celinska država' });
    expect(factContent(item('country-is'), data).lines[1]).toEqual({
      label: 'Sosednje države: nobena (otoška država)',
    });
  });
});
