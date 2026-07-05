// jest.config.mjs
export default {
  testEnvironment: 'node',
  transform: {},

  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/scan-test/'],
  testTimeout: 30000,

  testMatch: ['**/scan-test/**/*.test.js'],
};
