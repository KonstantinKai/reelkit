import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'dts-nodenext',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // The type check runs the TypeScript compiler over every published
    // declaration of the ten packages, which takes longer than a unit test.
    testTimeout: 120_000,
  },
});
