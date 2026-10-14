import { defineConfig } from 'vitest/config';

// Only the emulator-backed rules tests (npm run test:rules); the main suite never sees them.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['firestore/**/*.emulator.test.ts'],
    testTimeout: 20_000,
    fileParallelism: false,
  },
});
