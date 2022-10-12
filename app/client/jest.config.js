module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transformIgnorePatterns: [
    '/node_modules/(?!vuex-composition-helpers).+\\.js$',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,vue}',
    '!src/main.ts',
  ],
  moduleNameMapper: {
    '^@env(.*)$': '<rootDir>/src/resources/development$1',
  },
};
