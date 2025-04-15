/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.jest.json',
            diagnostics: {
                ignoreCodes: [2322, 2339]
            }
        }]
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testTimeout: 30000, // 30 seconds
    maxWorkers: process.env.CI ? 2 : '50%',
    verbose: true
};