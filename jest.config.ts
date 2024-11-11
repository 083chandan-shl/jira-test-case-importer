/** @type {import('ts-jest').JestConfigWithTsJest} */
// require('ts-node').register({ transpileOnly: true });

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['node_modules', '*.spec.ts'],
  testRegex: '.spec.ts',
};
