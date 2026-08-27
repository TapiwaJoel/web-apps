import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/**
 * A remote is only ever used *through its shell*: the shell host (:4200)
 * lazy-loads this remote at the `/umdzidzisi-admin` route. So e2e drives the
 * shell, not the raw remote port (which serves only `remoteEntry.json`). The
 * `webServer` array below boots the same shell + remote pair that
 * `tools/scripts/dev.mjs umdzidzisi:admin` runs in dev:
 *   - shell-admin @4200, served with `--configuration umdzidzisi`
 *   - umdzidzisi-admin remote @4203
 * `reuseExistingServer: true` means an already-running `npm run umdzidzisi:admin`
 * dev session is reused instead of double-booting the ports.
 */

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Generated as a .mts file so Node forces ESM regardless of workspace
 * `type`. Playwright routes `.mts` through its ESM loader (dynamic import,
 * bypassing the pirates CJS-compile path), and Nx's native TS strip loads
 * `.mts` directly. Playwright's configLoader auto-discovers
 * `playwright.config.mts` via its extension list
 * (.ts/.js/.mts/.mjs/.cts/.cjs).
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Boot the shell host + this remote together (mirrors dev.mjs umdzidzisi:admin). */
  webServer: [
    {
      command: 'npx nx run shell-admin:serve --configuration umdzidzisi',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 180_000, // native-federation cold start is slow
    },
    {
      command: 'npx nx run umdzidzisi-admin:serve',
      url: 'http://localhost:4203/remoteEntry.json',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
