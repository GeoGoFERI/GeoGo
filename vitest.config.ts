import { defineConfig } from 'vitest/config';

// Unit tests cover the pure core and the data validation; they run in plain Node.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // The contrast test reads the colour tokens with `?raw`; other CSS stays stubbed.
    css: { include: [/tokens\.css/] },
  },
});
