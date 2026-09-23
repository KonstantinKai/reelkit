import vue from 'eslint-plugin-vue';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: await import('@typescript-eslint/parser'),
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      // Components are authored as defineComponent + h() in .ts files;
      // grouping related sub-components (CloseButton + SoundButton +
      // PlayerControls, ReelPlayerOverlay + ReelPlayerContent, etc.) in
      // a single file is intentional in this binding package.
      'vue/one-component-per-file': 'off',
      // Vue's prop validator requires `default` even for `required: true`
      // props, but a required prop never falls through to a default —
      // the rule is wrong-headed for TS-typed prop definitions.
      'vue/require-default-prop': 'off',
      // `_` is the conventional placeholder for parameters that exist
      // only to satisfy a callback signature (e.g. emit validators).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
