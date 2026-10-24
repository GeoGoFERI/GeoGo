export type EuropeGroup = 'zahodna' | 'srednja' | 'severna' | 'juzna' | 'balkan' | 'vzhodna';

export type PlaceRow = {
  geo: string;
  a2: string;
  nameSl: string;
  plural?: boolean;
  status: 'country' | 'territory' | 'other';
  europe?: EuropeGroup;
};
