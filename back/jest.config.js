/* eslint-disable @typescript-eslint/no-unused-vars */
const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // look for tests inside src
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__test__/**/*.ts', '**/*.test.ts'], // supports both __test__ folders and *.test.ts files
  clearMocks: true,
  verbose: true,
};