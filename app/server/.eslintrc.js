module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    env: {
        "node": true
    },
    overrides: [{
      files: [
          "**/tests/unit/**/*.test.{j,t}s?(x)"
      ],
      env: {
          jest: true
      },
      rules: {
          "@typescript-eslint/no-explicit-any": "off"
      }
  }]
  };