module.exports = {
  displayName: 'reelkit-angular-reel-player',
  preset: '../../jest.preset.js',
  moduleNameMapper: {
    '^@reelkit/angular$': '<rootDir>/../reelkit-angular/src/index.ts',
    '^@reelkit/core$': '<rootDir>/../reelkit-core/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/packages/reelkit-angular-reel-player',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
