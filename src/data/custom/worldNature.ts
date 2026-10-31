import type { MultiPolygon } from 'geojson';

// Hand-drawn, simplified outlines for Level 5 items Natural Earth does not have. Lon/lat, traced
// roughly from general atlas knowledge, not surveyed; a teacher should check them.
export const HAND_DRAWN_WORLD: Readonly<Record<string, MultiPolygon>> = {
  // A band along the Queensland coast, offshore, from Cape York to the Tropic of Capricorn.
  'reef-veliki-koralni': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [143.6, -10.6],
          [144.6, -12.6],
          [145.8, -14.6],
          [146.9, -16.6],
          [148.6, -18.6],
          [151.0, -20.6],
          [152.9, -22.6],
          [153.4, -24.0],
          [152.2, -24.2],
          [150.4, -22.4],
          [148.2, -20.4],
          [146.4, -18.6],
          [145.4, -16.4],
          [144.2, -14.4],
          [143.2, -12.4],
          [142.6, -10.8],
          [143.6, -10.6],
        ],
      ],
    ],
  },
  // The basin around Lake Chad, between the Sahara to the north and the highlands to the south.
  'lowland-cadska': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [12.0, 11.0],
          [14.0, 9.2],
          [18.0, 9.0],
          [21.0, 11.0],
          [23.0, 15.0],
          [22.0, 19.0],
          [18.0, 20.0],
          [15.0, 19.0],
          [13.0, 16.0],
          [12.0, 13.0],
          [12.0, 11.0],
        ],
      ],
    ],
  },
  // The high plateau of Kenya, Uganda and Tanzania around Lake Victoria.
  'plateau-vzhodnoafrisko': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [29.5, -1.0],
          [30.5, 2.0],
          [33.0, 4.5],
          [36.0, 4.0],
          [38.5, 2.5],
          [38.5, -2.0],
          [37.5, -6.0],
          [35.0, -9.0],
          [32.0, -9.0],
          [30.0, -6.0],
          [29.5, -1.0],
        ],
      ],
    ],
  },
};
