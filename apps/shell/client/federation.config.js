import {
  withNativeFederation,
  shareAll,
} from '@angular-architects/native-federation/config.js';

export default withNativeFederation({
  name: 'shell-client',

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
        build: 'package',
      },
      {
        overrides: {
          // includeSecondaries is an opt-out of ignoreUnusedDeps, so all of
          // @angular/core is shared to prevent mismatches.
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
    '@mushaviri/data-access': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@mushaviri/ui-common': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@mushaviri/util-event-bus': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@mushaviri/util-theming': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Angular DevKit & Build Tools
    '@angular-devkit/build-angular',
    '@angular-devkit/core',
    '@angular-devkit/schematics',
    '@angular/build',
    // Testing Tools
    'karma',
    '@angular/localize/tools',
    'vitest',
    '@vitest/coverage-v8',
    '@vitest/ui',
    '@analogjs/vitest-angular',
    '@playwright/test',
    'jsdom',
    // Build/Dev Tools
    'vite',
    'vite-tsconfig-paths',
    'esbuild',
    '@nx/vite',
    '@nx/vitest',
    // Server/SSR packages
    '@angular/platform-server',
    '@angular/ssr',
    'express',
    'supertest',
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // ignoreUnusedDeps is enabled by default now
    // ignoreUnusedDeps: true,

    // Opt-in: groups chunks in remoteEntry.json for smaller metadata file
    denseChunking: true,
  },
});
