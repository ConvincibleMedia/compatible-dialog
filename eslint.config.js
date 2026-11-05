module.exports = [
  { ignores: ["node_modules/**","tests/results/**","tests/report/**","dist/**","src/polyfill/**"] },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-constant-binary-expression': 'error',
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-func-assign': 'error',
      'no-promise-executor-return': 'error',
      'no-self-assign': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error'
    }
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'script' }
  },
  {
    files: ['scripts/**/*.js', 'tests/playwright.config.js', 'tests/support/server.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        require: 'readonly', module: 'readonly', __dirname: 'readonly',
        process: 'readonly', console: 'readonly', Buffer: 'readonly',
        URL: 'readonly', setTimeout: 'readonly'
      }
    },
    rules: { 'no-undef': 'error' }
  }
];
