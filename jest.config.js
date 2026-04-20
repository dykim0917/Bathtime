module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/src', '<rootDir>/app'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};
