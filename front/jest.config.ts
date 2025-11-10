import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  clearMocks: true,

  // Use the test-specific TypeScript configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },

  // Mapea los estilos (scss, css, etc.) para que no tiren error
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },

  // Archivos que se ejecutan antes de los tests
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // Patrón para detectar tests
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js)",
  ],
};

export default config;
