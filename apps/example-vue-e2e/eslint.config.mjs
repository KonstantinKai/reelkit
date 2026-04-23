import playwright from 'eslint-plugin-playwright';
import baseConfig from '../../eslint.config.mjs';

export default [
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      'playwright/expect-expect': 'off',
      'playwright/no-skipped-test': 'off',
      '@nx/workspace-constant-naming': 'off',
      '@nx/workspace-fields-before-callbacks': 'off',
      '@nx/workspace-lines-between-type-members': 'off',
    },
  },
];
