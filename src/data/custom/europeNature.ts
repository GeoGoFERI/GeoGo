import type { MultiPolygon } from 'geojson';

// hand-drawn, simplified outlines for Level 4 items that Natural Earth does not have. Lon/lat,
// roughly traced from general atlas knowledge, not surveyed. They are deliberately coarse: big
// enough to tap, never used for any measurement. A geography teacher should look at them on the
// map.
export const HAND_DRAWN: Readonly<Record<string, MultiPolygon>> = {
  // The plain around the middle Danube and the Tisza: bounded by the Alps in the west, the
  // Carpathians in the north and east and the Dinaric mountains in the south. It reaches
  // north-eastern Slovenia (Prekmurje).
  'lowland-panonska': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [16.0, 46.9],
          [16.4, 47.7],
          [17.0, 48.0],
          [17.8, 47.9],
          [18.8, 47.8],
          [19.6, 48.2],
          [20.6, 48.4],
          [21.5, 48.5],
          [22.2, 48.3],
          [22.8, 47.9],
          [22.4, 47.2],
          [21.9, 46.6],
          [21.9, 45.9],
          [21.4, 45.2],
          [20.6, 44.9],
          [19.5, 44.9],
          [18.6, 45.1],
          [17.6, 45.2],
          [16.6, 45.6],
          [16.1, 46.3],
          [16.0, 46.9],
        ],
      ],
    ],
  },
  // The East European (Russian) Plain: from eastern Poland and the Baltic to the Urals, and from
  // the White Sea down to the Black Sea and the Caspian lowland. It leaves out the Carpathians
  // and Crimea's mountains. Natural Earth's "Northern European Plain" is a narrower band
  // that misses Belarus and Ukraine, so it is not used.
  'lowland-vzhodnoevropsko': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [22.8, 52.2],
          [23.2, 54.6],
          [24.2, 57.4],
          [28.0, 59.8],
          [33.0, 62.0],
          [38.0, 64.4],
          [44.0, 66.0],
          [52.0, 67.4],
          [58.0, 67.8],
          [58.8, 63.0],
          [58.2, 58.0],
          [56.8, 54.0],
          [55.0, 51.4],
          [50.0, 48.4],
          [47.0, 46.2],
          [42.0, 45.6],
          [39.0, 47.0],
          [35.2, 46.4],
          [33.0, 46.2],
          [30.2, 46.6],
          [28.2, 48.0],
          [26.0, 49.0],
          [24.2, 50.2],
          [22.8, 52.2],
        ],
      ],
    ],
  },
  // Central European uplands: the belt from the Ardennes and the Rhenish uplands over the Harz
  // and the Thuringian Forest to the Bohemian Massif and the Sudetes, plus the Massif Central.
  'mountain-evropska-sredogorja': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [5.6, 50.0],
          [6.0, 50.9],
          [7.5, 51.4],
          [9.2, 51.9],
          [10.8, 51.9],
          [12.0, 51.2],
          [13.5, 51.0],
          [15.0, 51.0],
          [16.5, 50.6],
          [17.4, 50.1],
          [16.8, 49.4],
          [15.6, 49.0],
          [14.3, 48.6],
          [13.2, 48.8],
          [12.0, 49.2],
          [10.8, 48.8],
          [9.5, 48.4],
          [8.3, 47.7],
          [7.6, 47.8],
          [7.0, 48.2],
          [6.6, 48.6],
          [6.1, 49.4],
          [5.6, 50.0],
        ],
      ],
      [
        [
          [2.0, 45.0],
          [2.5, 46.2],
          [3.5, 46.3],
          [4.5, 45.7],
          [4.4, 44.6],
          [3.6, 43.9],
          [2.6, 43.7],
          [1.9, 44.3],
          [2.0, 45.0],
        ],
      ],
    ],
  },
};
