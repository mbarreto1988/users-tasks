const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const eslintPluginImport = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname, // 👈 esto es lo importante
        sourceType: 'module',
      },
      globals: {
        console: true,
        process: true,
        __dirname: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: eslintPluginImport,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external', 'internal']],
          'newlines-between': 'always',
        },
      ],
      semi: ['error', 'always'],
      quotes: ['warn', 'single'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
