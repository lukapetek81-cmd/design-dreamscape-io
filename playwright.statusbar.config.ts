import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'status-bar-regression.spec.ts',
  fullyParallel: true,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'off', screenshot: 'off', video: 'off',
    launchOptions: { executablePath: '/chromium-1194/chrome-linux/chrome' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
