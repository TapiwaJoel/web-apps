# Adding Remote Applications Guide

This guide provides step-by-step instructions for adding new remote applications to the micro-frontend monorepo.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Guide](#step-by-step-guide)
- [Configuration Reference](#configuration-reference)
- [Testing Your Remote App](#testing-your-remote-app)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Adding a new remote application involves:

1. Generating a new Angular application with NX
2. Configuring Native Federation
3. Converting to a pure remote module (no standalone capability)
4. Exposing components/modules
5. Updating the shell's federation manifest
6. Adding routes in the shell application
7. Adding to the app selector UI
8. Testing the integration

**Time to Complete**: ~15-20 minutes

**Important**: Remote applications in this architecture are **pure remote modules**. Each does have a `serve` target on its own port, but that port only serves `remoteEntry.json`; the app itself is always reached through a shell at `http://localhost:4200`.

The workspace currently ships three products — `umdzidzisi`, `umtengesi` and `insurance` — each with a `website`, `admin` and `client` remote.

## Prerequisites

Before starting, ensure you have:

- Node.js 20.x or higher installed
- NX CLI knowledge (or follow the commands provided)
- Basic understanding of Angular routing
- Understanding of Module Federation concepts (see [ARCHITECTURE.md](../ARCHITECTURE.md))

## Step-by-Step Guide

### Step 1: Generate New Angular Application

Use the NX Angular generator to create a new application:

```bash
# Generate a new Angular application
npx nx g @nx/angular:app my-remote-app

# When prompted, select:
# - Standalone components: Yes
# - Routing: Yes
# - Stylesheet format: scss
# - E2E test runner: playwright
# - Linter: eslint
```

This creates:

```
apps/
├── my-remote-app/
│   ├── src/
│   ├── project.json
│   └── tsconfig.app.json
└── my-remote-app-e2e/
```

### Step 2: Configure Project Tags

Update the project tags in `apps/my-remote-app/project.json`:

```json
{
  "name": "my-remote-app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "org",
  "sourceRoot": "apps/my-remote-app/src",
  "tags": ["scope:my-remote-app", "type:app"],
  "targets": {
    // ... targets will be configured next
  }
}
```

### Step 3: Install Native Federation (If Not Already Installed)

The Native Federation plugin should already be in your workspace. Verify in `package.json`:

```json
{
  "devDependencies": {
    "@angular-architects/native-federation": "^22.0.3"
  }
}
```

If not present:

```bash
npm install @angular-architects/native-federation --save-dev
```

### Step 4: Configure Native Federation Build (Pure Remote Module)

Update `apps/my-remote-app/project.json` to use Native Federation as a **pure remote module**.

**Important**: A remote app does have `serve` and `serve-original` targets on its own dedicated port, but that port only serves the app's `remoteEntry.json` for the shell to fetch. The application itself is always used through the shell at `http://localhost:4200` — that is also why e2e tests drive `:4200` rather than the remote's port.

```json
{
  "name": "my-remote-app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "org",
  "sourceRoot": "apps/my-remote-app/src",
  "tags": ["scope:my-remote-app", "type:app"],
  "targets": {
    "build": {
      "executor": "@angular-architects/native-federation:build",
      "defaultConfiguration": "production",
      "options": {
        "cacheExternalArtifacts": true
      },
      "configurations": {
        "production": {
          "target": "my-remote-app:esbuild:production"
        },
        "development": {
          "target": "my-remote-app:esbuild:development",
          "dev": true
        }
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "esbuild": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/my-remote-app",
        "browser": "apps/my-remote-app/src/main.ts",
        "tsConfig": "apps/my-remote-app/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/my-remote-app/public"
          }
        ],
        "styles": ["apps/my-remote-app/src/styles.scss"],
        "polyfills": ["es-module-shims"]
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      }
    }
  }
}
```

**Key differences from standalone apps:**

- ❌ No `serve` target
- ❌ No `serve-static` target
- ❌ No `serve-original` target
- ✅ Only `build`, `lint`, and `esbuild` targets

### Step 5: Configure main.ts as Pure Remote Module

Update `apps/my-remote-app/src/main.ts` to be a pure remote module:

```typescript
// This is a pure remote module - no standalone bootstrap
// The shell application handles initialization and loading
// All exposed modules are defined in federation.config.js
```

**Remove** any `initFederation()` or `bootstrapApplication()` calls. The remote app should NOT bootstrap itself.

### Step 7: Configure Federation Settings

Create or update `apps/my-remote-app/federation.config.js`:

```javascript
import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'my-remote-app',

  exposes: {
    './Component': './apps/my-remote-app/src/app/app.ts',
    './Routes': './apps/my-remote-app/src/app/app.routes.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
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
    '@mushaviri/api': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@mushaviri/ui': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@mushaviri/util': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    denseChunking: true,
  },
});
```

#### Exposing `./Component` and `./Routes`

Not every shell asks a remote for the same thing:

- `shell-web` and `shell-client` call `loadRemoteModule(name, './Component')` and wrap the default-exported component in a route.
- `shell-admin` calls `loadRemoteModule(name, './Routes')` for admin and client remotes and uses the exported `Routes` array directly.

The older `umdzidzisi` and `umtengesi` remotes expose only `./Component`, which means they can only be loaded from the shells that ask for it. The `insurance` remotes expose **both**, and that is the convention to follow for anything new: expose `./Component` _and_ `./Routes` so the remote is loadable from any shell without further changes.

- `./Component` → `src/app/app.ts`, which must `export default App;`
- `./Routes` → `src/app/app.routes.ts`, which must export a `Routes` array

#### Adding a Whole New Product

A single remote just needs the steps above. A new **product** (a `website` / `admin` / `client` trio, like `insurance`) also needs shell-side wiring, because each shell picks its product through an Nx build configuration that file-replaces the environment:

1. Add `apps/shell/<web|admin|client>/src/environments/environment.<product>.ts` — one per shell. It declares `defaultTheme` and the `remotes` map, where each remote carries an auth mode. The convention is `website: 'none'`, `admin: 'required'`, `client: 'optional'`.
2. Add a `<product>` configuration to each shell's `project.json`, under both `esbuild` (with the `fileReplacements` entry swapping `environment.ts` for `environment.<product>.ts`) and `serve` (pointing at `serve-original:<product>`).

The shell's route guards read the auth mode out of that environment at runtime, so no guard code changes when a product is added.

### Step 8: Create App Component

Update `apps/my-remote-app/src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'org-root',
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>My Remote App</h1>
      </div>
      <div class="app-content">
        <p>This is a new remote application loaded via Module Federation.</p>
        <div class="feature-list">
          <h2>Features</h2>
          <ul>
            <li>Remote module loading</li>
            <li>Lazy loading support</li>
            <li>Independent deployment</li>
            <li>Shared dependencies</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .app-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .app-header h1 {
        margin: 0;
      }

      .app-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .feature-list h2 {
        color: #333;
        margin-bottom: 1rem;
      }

      .feature-list ul {
        list-style: none;
        padding: 0;
      }

      .feature-list li {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: #f5f5f5;
        border-left: 4px solid #667eea;
        border-radius: 4px;
      }
    `,
  ],
})
export class App {
  protected title = 'my-remote-app';
}

// IMPORTANT: Export as default for Native Federation
export default App;
```

**Critical**: The `export default App;` is required for Native Federation to expose the component.

#### 5.4 Create App Config

Update `apps/my-remote-app/src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(appRoutes)],
};
```

#### 5.5 Create Routes

Update `apps/my-remote-app/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  // Add your routes here
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
];
```

### Step 6: Add Shared Library Dependencies (Optional)

If your remote app needs authentication, theming, or event bus:

```typescript
// apps/my-remote-app/src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { apiInterceptor } from '@mushaviri/util';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(appRoutes), provideHttpClient(withInterceptors([apiInterceptor]))],
};
```

Use shared services in your component:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SessionStore, ThemeService } from '@mushaviri/util';

@Component({
  // ...
})
export class App implements OnInit {
  private session = inject(SessionStore);
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Session state is exposed as signals by SessionStore
    console.log('Current user:', this.session.user());

    this.themeService.setTheme('my-remote-app');
  }
}
```

### Step 9: Update Federation Manifest

Add your new remote app to the shell's federation manifest:

There is no project named `shell` — there are three shells: `shell-web`, `shell-admin` and `shell-client`, living at `apps/shell/web/`, `apps/shell/admin/` and `apps/shell/client/`. Each keeps its own manifest, so add the entry to every shell that should be able to load your remote.

**Files**: `apps/shell/web/public/federation.manifest.json`, `apps/shell/admin/public/federation.manifest.json`, `apps/shell/client/public/federation.manifest.json`

Remote names follow a `<product>-<type>` convention (`umdzidzisi-admin`, `insurance-client`, …):

```json
{
  "umdzidzisi-website": "http://localhost:4201/remoteEntry.json",
  "umdzidzisi-admin": "http://localhost:4203/remoteEntry.json",
  "umdzidzisi-client": "http://localhost:4205/remoteEntry.json",
  "umtengesi-website": "http://localhost:4202/remoteEntry.json",
  "umtengesi-admin": "http://localhost:4204/remoteEntry.json",
  "umtengesi-client": "http://localhost:4206/remoteEntry.json",
  "insurance-website": "http://localhost:4207/remoteEntry.json",
  "insurance-admin": "http://localhost:4208/remoteEntry.json",
  "insurance-client": "http://localhost:4209/remoteEntry.json",
  "my-remote-app": "http://localhost:4210/remoteEntry.json"
}
```

**Note**: The port in each manifest entry is the remote's own `serve` port — the shell fetches `remoteEntry.json` from it.

### Step 10: Add to Shell's Build Dependencies

Update the shell's serve configuration to automatically build your new remote app:

**Files**: `apps/shell/web/project.json`, `apps/shell/admin/project.json`, `apps/shell/client/project.json`

Find the `serve` target and add your app to the `dependsOn` array:

```json
{
  "serve": {
    "executor": "@angular-architects/native-federation:build",
    "dependsOn": ["umdzidzisi-website:build", "umtengesi-website:build", "insurance-website:build", "my-remote-app:build"],
    "options": {
      "target": "shell:serve-original:development"
    }
  }
}
```

This ensures your remote app is built before the shell starts.

### Step 11: Add to App Selector UI

Update the app selector component to include your new remote app:

**Files**: `apps/shell/web/src/app/components/app-selector/app-selector.component.ts` (and the same file under `apps/shell/admin/` / `apps/shell/client/`)

Add an entry to the selector's `allApps` array:

```typescript
allApps: RemoteApp[] = [
  {
    id: 'umdzidzisi-website',
    name: 'Umdzidzisi Website',
    description: 'Public-facing website for Umdzidzisi',
    route: '/umdzidzisi-website'
  },
  {
    id: 'umtengesi-website',
    name: 'Umtengesi Website',
    description: 'Public-facing website for Umtengesi',
    route: '/umtengesi-website'
  },
  {
    id: 'insurance-website',
    name: 'Insurance Website',
    description: 'Public-facing website for Insurance',
    route: '/insurance-website'
  },
  // NEW: Add your remote app here
  {
    id: 'my-remote-app',
    name: 'My Remote App',
    description: 'Description of your new remote application',
    route: '/my-remote-app'
  }
];
```

### Step 12: Add Route in Shell Application

Update the shell's route configuration to include the new remote:

**Files**: `apps/shell/web/src/app/app.routes.ts`, `apps/shell/admin/src/app/app.routes.ts`, `apps/shell/client/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { requiredAuthGuard } from '@mushaviri/util';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [requiredAuthGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'umdzidzisi-website',
    canActivate: [requiredAuthGuard],
    loadChildren: () =>
      loadRemoteModule('umdzidzisi-website', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'insurance-website',
    canActivate: [requiredAuthGuard],
    loadChildren: () =>
      loadRemoteModule('insurance-website', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  // NEW: Add your remote app route
  {
    path: 'my-remote-app',
    canActivate: [requiredAuthGuard],
    loadChildren: () =>
      loadRemoteModule('my-remote-app', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
```

## Testing Your Remote App

### Important: Testing Through the Shell

Since remote apps cannot run independently, all testing must be done through the shell application.

### Step 1: Build Your Remote App

First, build your remote app to ensure there are no compilation errors:

```bash
# Build only the remote app
npm exec nx build my-remote-app

# Or build all remote apps
npm run build:remotes
```

If the build succeeds, you'll see output similar to:

```
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Output written to: dist/apps/my-remote-app
```

### Step 2: Start the Shell Application

Start the shell application (which will automatically build all remote apps including yours):

```bash
# Using npm script
npm start

# Or using nx directly (pick the shell you need — all three use port 4200)
npm exec nx serve shell-web
npm exec nx serve shell-admin
npm exec nx serve shell-client
```

The shell will start on `http://localhost:4200` and automatically build all remote apps (including yours) before serving.

### Step 3: Access Your Remote App

1. Open your browser to `http://localhost:4200`
2. Log in (use the authentication credentials)
3. You'll see the dashboard with the **app selector**
4. Click on your new remote app card to load it
5. OR navigate directly to `http://localhost:4200/my-remote-app`

### Step 4: Verify Integration

Check the following in your browser's Developer Tools:

✅ **Console Tab:**

- No errors during remote module loading
- No 404 errors for remoteEntry.json
- Application loads successfully

✅ **Network Tab:**

- `remoteEntry.json` loads successfully
- Remote app chunks load on demand
- No failed requests

✅ **Functionality:**

- Your remote app displays correctly
- Routing works within your app
- Shared services (auth, event bus, theme) work correctly
- Navigation back to dashboard works

### Common Issues During Testing

**Issue**: `Failed to fetch dynamically imported module`

- **Solution**: Ensure your remote app is built (check dist/apps/my-remote-app/)
- **Solution**: Verify federation manifest has correct URL

**Issue**: `Cannot find module './Component'`

- **Solution**: Ensure `app.ts` has `export default App;`
- **Solution**: Check `federation.config.js` exposes `'./Component'` (and `'./Routes'`, which new remotes should also expose)

**Issue**: Remote app doesn't appear in app selector

- **Solution**: Verify you added it to the shell's `app-selector.component.ts` (`allApps`)
- **Solution**: Verify the route is defined in shell's `app.routes.ts`

## Configuration Reference

### Required Files for Remote Apps

| File                                       | Purpose                                        | Required    |
| ------------------------------------------ | ---------------------------------------------- | ----------- |
| `apps/my-remote-app/project.json`          | NX and Federation build configuration          | ✅ Yes      |
| `apps/my-remote-app/federation.config.js`  | Native Federation configuration                | ✅ Yes      |
| `apps/my-remote-app/src/main.ts`           | Entry point (should be empty for pure remotes) | ✅ Yes      |
| `apps/my-remote-app/src/app/app.ts`        | Root component (must export default)           | ✅ Yes      |
| `apps/my-remote-app/src/app/app.config.ts` | Application configuration                      | ⚠️ Optional |
| `apps/my-remote-app/src/app/app.routes.ts` | Route configuration                            | ⚠️ Optional |

**Important**: Remote apps do NOT have:

- ❌ No `bootstrap.ts` file
- ❌ No `initFederation()` call in `main.ts`
- ❌ No `bootstrapApplication()` call

They DO have `serve` and `serve-original` targets on a dedicated port (see the port table below) — that port exists so the shell can fetch `remoteEntry.json`, not so the app can be browsed directly.

### Application Ports

| App                | Port | Purpose                                         |
| ------------------ | ---- | ----------------------------------------------- |
| shell-web          | 4200 | Host — the URL you browse (one shell at a time) |
| shell-admin        | 4200 | Host — the URL you browse (one shell at a time) |
| shell-client       | 4200 | Host — the URL you browse (one shell at a time) |
| umdzidzisi-website | 4201 | Serves `remoteEntry.json` to the shell          |
| umdzidzisi-admin   | 4203 | Serves `remoteEntry.json` to the shell          |
| umdzidzisi-client  | 4205 | Serves `remoteEntry.json` to the shell          |
| umtengesi-website  | 4202 | Serves `remoteEntry.json` to the shell          |
| umtengesi-admin    | 4204 | Serves `remoteEntry.json` to the shell          |
| umtengesi-client   | 4206 | Serves `remoteEntry.json` to the shell          |
| insurance-website  | 4207 | Serves `remoteEntry.json` to the shell          |
| insurance-admin    | 4208 | Serves `remoteEntry.json` to the shell          |
| insurance-client   | 4209 | Serves `remoteEntry.json` to the shell          |

**Note**: The three shells all bind port 4200, so only one runs at a time. Every remote does have a real `serve` target on its own port, but a remote is only ever _used_ through the shell at `http://localhost:4200` — its own port is what the shell fetches `remoteEntry.json` from. That is why the e2e suites navigate to `:4200` and never to a remote's port.

### TypeScript Path Mapping

If your remote app needs to be imported elsewhere, add it to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@mushaviri/my-remote-app": ["apps/my-remote-app/src/index.ts"]
    }
  }
}
```

## Testing Your Remote App

### Unit Tests

```bash
# Run unit tests
npx nx test my-remote-app

# Run with coverage
npx nx test my-remote-app --coverage

# Run in watch mode
npx nx test my-remote-app --watch
```

### E2E Tests

```bash
# Run E2E tests
npx nx e2e my-remote-app-e2e

# Run in headed mode
npx nx e2e my-remote-app-e2e --headed

# Run in UI mode
npx nx e2e my-remote-app-e2e --ui
```

### Manual Testing Checklist

- [ ] Remote app loads in standalone mode (`http://localhost:4204`)
- [ ] Remote app loads in shell (`http://localhost:4200/my-remote-app`)
- [ ] Authentication works (if using `authGuard`)
- [ ] Shared services are accessible (auth, events, theme)
- [ ] Navigation works between shell and remote
- [ ] No console errors
- [ ] Styles are applied correctly
- [ ] Hot reload works during development

## Troubleshooting

### Issue: Remote App Not Loading

**Symptoms**: Blank page, console error "Cannot load remote module"

**Solutions**:

1. Verify the remote app is running (`npx nx serve my-remote-app`)
2. Check the federation manifest has the correct URL
3. Check browser console for specific errors
4. Verify the port in federation manifest matches the serve port

### Issue: Component Not Found

**Symptoms**: Error "Module './Component' not found"

**Solutions**:

1. Ensure the root component has `export default` at the end
2. Verify the component is exported from `app.ts`
3. Check the `loadRemoteModule` path is correct (`'./Component'`)

### Issue: Shared Services Not Working

**Symptoms**: Authentication state not shared, events not received

**Solutions**:

1. Verify services are marked with `providedIn: 'root'`
2. Check that the remote app imports shared libraries correctly
3. Ensure dependencies are shared in Native Federation config
4. Verify both apps use the same version of shared libraries

### Issue: Port Conflict

**Symptoms**: Error "Port 4204 is already in use"

**Solutions**:

1. Choose a different port in `project.json`
2. Kill the process using that port
3. Update the federation manifest with the new port

### Issue: Build Fails

**Symptoms**: Build errors during `npx nx build my-remote-app`

**Solutions**:

1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors: `npx nx typecheck my-remote-app`
3. Check for circular dependencies
4. Verify all imports are correct

### Issue: Hot Reload Not Working

**Symptoms**: Changes not reflected without full reload

**Solutions**:

1. Restart the dev server
2. Check for TypeScript errors
3. Clear the NX cache: `npx nx reset`
4. Verify file watchers are working

## Best Practices

### 1. Naming Conventions

- **App Names**: Use kebab-case (`my-remote-app`, not `MyRemoteApp`)
- **Component Selectors**: Use `org-` prefix (`org-my-component`)
- **Tags**: Use `scope:` and `type:` prefixes (`scope:my-remote-app`, `type:app`)

### 2. Port Management

- Document port assignments in a central location
- Use sequential port numbers (4201, 4202, 4203, ...)
- Don't hardcode ports in production configurations

### 3. Dependency Management

- Keep shared library versions in sync
- Use workspace-level dependencies when possible
- Avoid duplicating dependencies in remote apps

### 4. Component Design

- Keep remote components self-contained
- Minimize dependencies on shell
- Use event bus for cross-app communication
- Design for independent deployment

### 5. Error Handling

- Implement loading states
- Handle remote loading failures gracefully
- Provide fallback UI for network errors
- Log errors for debugging

Example:

```typescript
loadRemoteModule('my-remote-app', './Component')
  .then((m) => m.default)
  .catch((error) => {
    console.error('Failed to load remote app:', error);
    return ErrorComponent; // Fallback component
  });
```

### 6. Performance

- Lazy load remote apps only when needed
- Optimize bundle sizes
- Use OnPush change detection
- Preload likely-needed remotes

### 7. Testing

- Test remote app in isolation
- Test integration with shell
- Write E2E tests for critical flows
- Mock external dependencies

### 8. Documentation

- Document exposed modules
- Document required shared services
- Document environment variables
- Keep this guide updated

## Production Deployment

### Update Federation Manifest for Production

**Files**: `apps/shell/<web|admin|client>/public/federation.manifest.json`

```json
{
  "umdzidzisi-website": "https://umdzidzisi-website.example.com/remoteEntry.json",
  "umtengesi-website": "https://umtengesi-website.example.com/remoteEntry.json",
  "insurance-website": "https://insurance-website.example.com/remoteEntry.json",
  "my-remote-app": "https://my-remote-app.example.com/remoteEntry.json"
}
```

### Build for Production

```bash
# Build the remote app
npx nx build my-remote-app --configuration=production

# Build the shell
npx nx build shell-web --configuration=production
```

### Deploy

1. Deploy remote app to its hosting location
2. Ensure `remoteEntry.json` is accessible
3. Update shell's federation manifest
4. Deploy shell application
5. Test the integration

## Example: Complete Remote App

Here's a complete example of a remote app with all best practices:

**apps/my-remote-app/src/app/app.ts**:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionStore, ThemeService } from '@mushaviri/util';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'org-root',
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>{{ title }}</h1>
        @if (currentUser(); as user) {
          <p>Welcome, {{ user.name }}!</p>
        }
      </div>
      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 2rem;
      }
      .app-header {
        background: var(--primary-color);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
    `,
  ],
})
export class App implements OnInit {
  protected title = 'My Remote App';

  private session = inject(SessionStore);
  private themeService = inject(ThemeService);

  // Session state is exposed as signals
  protected currentUser = this.session.user;

  ngOnInit() {
    // Set theme
    this.themeService.setTheme('my-remote-app');
  }
}

export default App;
```

## Summary

You now know how to:

- Generate a new remote Angular application
- Configure Native Federation
- Expose components for remote loading
- Update the federation manifest
- Configure routes in the shell
- Test the integration
- Troubleshoot common issues
- Follow best practices

For more information:

- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture details
- [Native Federation Docs](https://github.com/angular-architects/module-federation-plugin)
