import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://dolibarr:80',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'report/allure-results' }],
    ['junit', { outputFile: 'report/junit/results.xml' }],
    ['html', { outputFolder: 'report/html', open: 'never' }]
  ],
  projects: [
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.spec\.ts/, 
      use: { storageState: undefined } 
    },
    { 
      name: 'chromium', 
      use: { 
        ...devices['Desktop Chrome'], 
        storageState: 'auth/state.json' 
      }, 
      dependencies: ['setup'] 
    }
  ],
});
