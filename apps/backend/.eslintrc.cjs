module.exports = {
  extends: ['../../.eslintrc.js', 'plugin:svelte/recommended'],
  env: {
    es2017: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
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
