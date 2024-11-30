module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^node-fetch$': 'node-fetch/lib/index.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!node-fetch)',
  ],
  testEnvironment: 'node',
}; 