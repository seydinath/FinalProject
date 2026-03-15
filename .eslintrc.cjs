module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/node_modules/**', 'loginChar/**'],
  plugins: ['react-hooks'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {},
    },
  ],
}