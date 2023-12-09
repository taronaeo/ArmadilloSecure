module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:svelte/recommended',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier',
  ],
  parserOptions: {
    extraFileExtensions: ['.svelte'],
  },
  overrides: [
    // Configure Svelte
    // See: https://github.com/sveltejs/svelte-eslint-parser
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
};
