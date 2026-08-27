# Web Apps - Angular Micro-Frontend Monorepo

A production-ready Angular monorepo implementing a **single entry point micro-frontend architecture** using NX and Native Federation. This project demonstrates modern frontend architecture patterns with a centralized shell, pure remote modules, shared libraries, and seamless inter-application communication.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Diagram](#architecture-diagram)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Shared Libraries](#shared-libraries)
- [Module Federation Configuration](#module-federation-configuration)
- [Testing](#testing)
- [Build and Deployment](#build-and-deployment)
- [Learn More](#learn-more)

## Project Overview

This repository showcases a **single entry point micro-frontend architecture** powered by Angular, NX, and Native Federation. It consists of:

- **Shell Application (Host)**: The single entry point that orchestrates and loads remote applications (Port 4200)
- **Remote Applications (Pure Modules)**: Build-only remote modules organized into nested domains
  - **umdzidzisi**: Contains website (4201), admin (4203), and client (4205) applications
  - **umtengesi**: Contains website (4202), admin (4204), and client (4206) applications
  - **insurance**: Contains website (4207), admin (4208), and client (4209) applications
- **App Selector UI**: Dashboard interface for selecting which application to run
- **Shared Libraries**: Reusable code shared across applications (authentication, theming, event bus, UI components)

### Single Entry Point Pattern

This architecture enforces **single entry point access**:

- ✅ All applications accessed through the shell at `http://localhost:4200`
- ✅ Remote apps are pure modules - cannot run independently
- ✅ App selector UI for choosing which application to run
- ✅ Centralized authentication and routing
- ✅ Unified user experience

### Technology Stack

- **Angular 21.2.9** - Modern Angular with standalone components
- **NX 23.0.1** - Monorepo tooling and build optimization
- **Native Federation** - Module Federation for Angular with native ESM support
- **TypeScript 5.9** - Type-safe development
- **SCSS** - Styling with theming support
- **Vitest** - Fast unit testing
- **Playwright** - End-to-end testing
- **Docker** - Containerization support

## Architecture Diagram

```
                         Browser: http://localhost:4200
┌──────────────────────────────────────────────────────────────────┐
│                    Shell Application (Port 4200)                  │
│                        ** SINGLE ENTRY POINT **                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  • Authentication & Authorization                          │  │
│  │  • App Selector Dashboard                                  │  │
│  │  • Native Federation Orchestration                         │  │
│  │  • Centralized Routing                                     │  │
│  │  • Shared Service Singletons                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                 │                                 │
│                   Dynamically Loads on Demand                     │
│                                 ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              <router-outlet>                               │  │
│  │                                                            │  │
│  │  Umdzidzisi Domain (Nested Structure)                           │  │
│  │  ├── umdzidzisi-website (Port 4201) - Public-facing website     │  │
│  │  ├── umdzidzisi-admin   (Port 4203) - Administration portal     │  │
│  │  └── umdzidzisi-client  (Port 4205) - Client dashboard          │  │
│  │                                                            │  │
│  │  Umtengesi Domain (Nested Structure)                           │  │
│  │  ├── umtengesi-website (Port 4202) - Public-facing website     │  │
│  │  ├── umtengesi-admin   (Port 4204) - Administration portal     │  │
│  │  └── umtengesi-client  (Port 4206) - Client dashboard          │  │
│  │                                                            │  │
│  │  Insurance Domain (Nested Structure)                           │  │
│  │  ├── insurance-website (Port 4207) - Public-facing website     │  │
│  │  ├── insurance-admin   (Port 4208) - Administration portal     │  │
│  │  └── insurance-client  (Port 4209) - Client dashboard          │  │
│  │                                                            │  │
│  │  All remotes: Pure Modules • Build-Only • No Standalone   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                  Uses Shared Libraries (Singletons)
                                 ↓
                  ┌───────────────────────────┐
                  │   Shared Libraries        │
                  ├───────────────────────────┤
                  │ • data-access-auth        │
                  │ • ui-common               │
                  │ • util-event-bus          │
                  │ • util-theming            │
                  └───────────────────────────┘

Key Points:
✅ Users access ONLY the shell at localhost:4200
✅ App selector UI lets users choose which app to run
✅ 6 remote apps organized in nested domain structure
✅ Each domain has website, admin, and client variants
✅ All authentication handled by shell
✅ Remote apps built automatically when shell starts
```

## Project Structure

```
web-apps/
├── apps/
│   ├── shell/                    # Host application (port 4200)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.ts              # Root component
│   │   │   │   ├── app.config.ts       # Application configuration
│   │   │   │   ├── app.routes.ts       # Routing with lazy-loaded remotes
│   │   │   │   ├── login/              # Login component
│   │   │   │   └── dashboard/          # Dashboard component
│   │   │   ├── main.ts                 # Entry point with federation init
│   │   │   └── bootstrap.ts            # Bootstrap logic
│   │   ├── public/
│   │   │   └── federation.manifest.json # Remote app manifest
│   │   └── project.json                # NX project configuration
│   │
│   ├── umdzidzisi/                     # Umdzidzisi domain (nested structure)
│   │   ├── website/              # Public-facing website (port 4201)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   ├── admin/                # Administration portal (port 4203)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   └── client/               # Client dashboard (port 4205)
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── app.ts          # Exposed component
│   │       │   │   ├── app.config.ts
│   │       │   │   └── app.routes.ts
│   │       │   └── main.ts             # Empty - pure remote module
│   │       └── project.json            # Build-only (no serve targets)
│   │
│   ├── umtengesi/                     # Umtengesi domain (nested structure)
│   │   ├── website/              # Public-facing website (port 4202)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   ├── admin/                # Administration portal (port 4204)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   └── client/               # Client dashboard (port 4206)
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── app.ts          # Exposed component
│   │       │   │   ├── app.config.ts
│   │       │   │   └── app.routes.ts
│   │       │   └── main.ts             # Empty - pure remote module
│   │       └── project.json            # Build-only (no serve targets)
│   │
│   ├── insurance/                     # Insurance domain (nested structure)
│   │   ├── website/              # Public-facing website (port 4207)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   ├── admin/                # Administration portal (port 4208)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.ts          # Exposed component
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   └── app.routes.ts
│   │   │   │   └── main.ts             # Empty - pure remote module
│   │   │   └── project.json            # Build-only (no serve targets)
│   │   │
│   │   └── client/               # Client dashboard (port 4209)
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── app.ts          # Exposed component
│   │       │   │   ├── app.config.ts
│   │       │   │   └── app.routes.ts
│   │       │   └── main.ts             # Empty - pure remote module
│   │       └── project.json            # Build-only (no serve targets)
│   │
│   └── e2e/                      # E2E test projects
│       ├── shell/                # E2E tests for shell application
│       ├── umdzidzisi/                 # E2E tests for Umdzidzisi domain
│       │   ├── website/          # E2E tests for umdzidzisi-website
│       │   ├── admin/            # E2E tests for umdzidzisi-admin
│       │   └── client/           # E2E tests for umdzidzisi-client
│       ├── umtengesi/                 # E2E tests for Umtengesi domain
│       │   ├── website/          # E2E tests for umtengesi-website
│       │   ├── admin/            # E2E tests for umtengesi-admin
│       │   └── client/           # E2E tests for umtengesi-client
│       └── insurance/                 # E2E tests for Insurance domain
│           ├── website/          # E2E tests for insurance-website
│           ├── admin/            # E2E tests for insurance-admin
│           └── client/           # E2E tests for insurance-client
│
├── libs/
│   └── shared/                   # Shared libraries
│       ├── data-access-auth/     # Authentication services
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── token.service.ts
│       │   │   └── logout.service.ts
│       │   ├── guards/
│       │   │   └── auth.guard.ts
│       │   └── interceptors/
│       │       └── auth.interceptor.ts
│       │
│       ├── ui-common/            # Common UI components
│       │   ├── shell-layout/
│       │   ├── notification/
│       │   ├── banner/
│       │   └── user-menu/
│       │
│       ├── util-event-bus/       # Event bus for inter-app communication
│       │   ├── event-bus.service.ts
│       │   └── models/
│       │       ├── app-event.model.ts
│       │       └── event-types.ts
│       │
│       └── util-theming/         # Theming system
│           ├── theme.service.ts
│           └── themes/
│               └── theme-config.ts
│
├── packages/
│   └── shared/
│       └── models/               # Shared data models
│
├── nx.json                       # NX workspace configuration
├── tsconfig.base.json            # TypeScript base configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Key Features

### 1. Single Entry Point Architecture

- **Centralized Access**: All applications accessed through a single shell URL
- **App Selector UI**: Interactive dashboard for choosing which application to run
- **Pure Remote Modules**: Remote apps are build-only and cannot run independently
- **Automatic Builds**: Remote apps built automatically when shell starts
- **Unified Authentication**: Single authentication flow for all applications
- **Nested Domain Structure**: Applications organized by domain (umdzidzisi, umtengesi, insurance) with multiple variants

### 2. Application Types

Each domain contains three distinct application types:

- **Website (Ports 4201, 4202, 4207)**: Public-facing website applications
  - Customer-facing features
  - Marketing content and landing pages
  - Public information and resources

- **Admin (Ports 4203, 4204, 4208)**: Administrative portal applications
  - Internal management tools
  - Configuration and settings
  - System administration features

- **Client (Ports 4205, 4206, 4209)**: Client dashboard applications
  - Authenticated user dashboards
  - Client-specific features and data
  - Personalized user experiences

### 3. Micro-Frontend Architecture

- **Independent Deployment**: Each application can be built and deployed separately
- **Runtime Loading**: Remote applications are loaded on-demand at runtime
- **Lazy Loading**: Routes lazy-load remote applications only when needed
- **Version Independence**: Different applications can use different versions (with caution)

### 4. Native Federation

- **Modern ESM**: Uses native ES modules instead of Webpack Module Federation
- **Build Tool Agnostic**: Works with esbuild, Vite, and other modern build tools
- **Optimized Loading**: Efficient chunk splitting and caching
- **Manifest-Based**: Central manifest file for remote application discovery

### 5. Shared Services (Singleton Pattern)

- **Authentication**: Centralized auth state shared across all applications
- **Event Bus**: Pub/sub pattern for inter-application communication
- **Theming**: Consistent theming across all micro-frontends
- **UI Components**: Shared component library

### 6. Authentication Flow

- **Route Guards**: Protect routes with authentication checks
- **Token Management**: JWT token storage and refresh logic
- **Logout Service**: Coordinated logout across all applications

### 7. Theming System

- **Route-Based Themes**: Automatic theme switching based on active route
- **CSS Custom Properties**: Theme variables using CSS custom properties
- **Multiple Themes**: Support for default, umdzidzisi, umtengesi, and insurance themes
- **Service-Based**: Centralized theme management

### 8. Event Bus Communication

- **Type-Safe Events**: TypeScript interfaces for event payloads
- **RxJS Observable**: Reactive event streams
- **Filtered Subscriptions**: Subscribe to specific event types
- **Cross-Application**: Communication between shell and remotes

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd web-apps
```

2. **Install dependencies**

```bash
npm install
```

### Running the Application

#### Start the Application (Single Entry Point)

Since this uses a **single entry point architecture**, you only need to start the shell. You can start all applications or specific ones based on your development needs:

```bash
# Start the shell with website remotes (umdzidzisi-website, umtengesi-website)
npm start

# Start specific domain applications
npm run umdzidzisi:website    # Shell + umdzidzisi-website
npm run umdzidzisi:admin      # Shell + umdzidzisi-admin
npm run umdzidzisi:client     # Shell + umdzidzisi-client

npm run umtengesi:website    # Shell + umtengesi-website
npm run umtengesi:admin      # Shell + umtengesi-admin
npm run umtengesi:client     # Shell + umtengesi-client

npm run insurance:website    # Shell + insurance-website
npm run insurance:admin      # Shell + insurance-admin
npm run insurance:client     # Shell + insurance-client
```

Each command will:

1. Kill any existing processes on ports 4200-4209
2. Build the selected remote app(s)
3. Start the shell on `http://localhost:4200`
4. Show the app selector dashboard
5. Allow you to choose which remote app to run

**Access the application**: Open `http://localhost:4200` in your browser

#### How It Works

1. Navigate to `http://localhost:4200`
2. Log in (if authentication is configured)
3. You'll see the **App Selector** dashboard
4. Click on an app card to load that remote application
5. The remote app loads dynamically within the shell

#### Development Commands

```bash
# Start the complete system with primary websites
npm start

# Start specific application types
npm run umdzidzisi:website    # Umdzidzisi website variant
npm run umdzidzisi:admin      # Umdzidzisi admin variant
npm run umdzidzisi:client     # Umdzidzisi client variant

npm run umtengesi:website     # Umtengesi website variant
npm run insurance:website     # Insurance website variant

# Build commands
npm run build:remotes   # Build all 9 remote apps
npm run build:all       # Build shell + all remotes
```

**Important**: Remote applications (umdzidzisi-website, umdzidzisi-admin, umdzidzisi-client, umtengesi-website, umtengesi-admin, umtengesi-client, insurance-website, insurance-admin, insurance-client) are always consumed through the shell at `http://localhost:4200`. Each remote does have its own `serve` target and dedicated port, but that port only serves its `remoteEntry.json` for the shell to fetch — it is not the URL you browse.

### Application Architecture

| Application           | Port | Can Run Independently? | Purpose                              |
| --------------------- | ---- | ---------------------- | ------------------------------------ |
| Shell (Host)          | 4200 | ✅ Yes                 | Single entry point, app orchestrator |
| **Umdzidzisi Domain** |      |                        |                                      |
| umdzidzisi-website    | 4201 | ❌ No                  | Public-facing website for Umdzidzisi |
| umdzidzisi-admin      | 4203 | ❌ No                  | Administration portal for Umdzidzisi |
| umdzidzisi-client     | 4205 | ❌ No                  | Client dashboard for Umdzidzisi      |
| **Umtengesi Domain**  |      |                        |                                      |
| umtengesi-website     | 4202 | ❌ No                  | Public-facing website for Umtengesi  |
| umtengesi-admin       | 4204 | ❌ No                  | Administration portal for Umtengesi  |
| umtengesi-client      | 4206 | ❌ No                  | Client dashboard for Umtengesi       |
| **Insurance Domain**  |      |                        |                                      |
| insurance-website     | 4207 | ❌ No                  | Public-facing website for Insurance  |
| insurance-admin       | 4208 | ❌ No                  | Administration portal for Insurance  |
| insurance-client      | 4209 | ❌ No                  | Client dashboard for Insurance       |

**Note**: The "Can Run Independently?" column refers to browsing the app directly. Every remote has a `serve` target on the port listed above, but that port exists to serve `remoteEntry.json` to the shell — the application itself is only ever reached through the shell at `http://localhost:4200`.

## Development Workflow

### Creating Components

```bash
# Create a component in a specific application
npx nx g @nx/angular:component my-component --project=umdzidzisi

# Create a component in a shared library
npx nx g @nx/angular:component my-component --project=ui-common
```

### Adding Dependencies

```bash
# Install a new package
npm install <package-name>

# The package will be available to all applications and libraries
```

### Linting

```bash
# Lint all projects
npx nx run-many --target=lint

# Lint specific project
npx nx lint shell

# Lint with auto-fix
npx nx lint shell --fix
```

### Formatting

```bash
# Format all files with Prettier (includes Tailwind class sorting)
npm run format

# Check formatting without making changes
npm run format:check
```

### Type Checking

```bash
# Check TypeScript types across all projects
npx nx run-many --target=typecheck
```

### Git Hooks

This project uses **Husky** for automated git hooks to ensure code quality:

#### Hooks in Place:

1. **pre-commit** (Fast - 5-15 seconds)
   - Runs Prettier and ESLint on staged files only
   - Automatically sorts Tailwind CSS classes
   - Managed by lint-staged for performance

2. **pre-push** (Moderate - 30s-2min)
   - Runs `nx affected -t lint build typecheck`
   - Only checks projects affected by your changes
   - Catches issues before they reach CI/CD

3. **commit-msg** (Instant)
   - Enforces conventional commit format
   - Format: `type(scope): description`
   - Example: `feat(shell): add navigation component`

#### Valid Commit Types:

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `ci`: CI/CD changes

#### Valid Scopes:

`shell`, `umdzidzisi-website`, `umdzidzisi-admin`, `umdzidzisi-client`, `umtengesi-website`, `umtengesi-admin`, `umtengesi-client`, `insurance-website`, `insurance-admin`, `insurance-client`, `ui-common`, `data-access-auth`, `util-event-bus`, `util-theming`, `models`, `deps`, `ci`, `workspace`

#### Bypassing Hooks (use sparingly):

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

**Note:** Hooks are configured in `.husky/` directory and run automatically. The `prepare` script in `package.json` ensures Husky is set up when you run `npm install`.

### Visualizing Dependencies

```bash
# Open interactive project graph
npx nx graph

# View specific project details
npx nx show project shell --web
```

## Adding New Remote Apps

See the detailed guide in [documentation/ADDING_REMOTE_APPS.md](documentation/ADDING_REMOTE_APPS.md) for step-by-step instructions on adding new remote applications to the monorepo.

**Quick Overview:**

1. Generate a new Angular application
2. Configure Native Federation
3. Add exposed modules
4. Update federation manifest
5. Configure routing in shell
6. Test integration

## Shared Libraries

### @mushaviri/data-access-auth

**Purpose**: Centralized authentication logic

**Exports**:

- `AuthService` - Login, logout, token refresh, user state management
- `TokenService` - Token storage and retrieval
- `LogoutService` - Coordinated logout
- `authGuard` - Route guard function
- `authInterceptor` - HTTP interceptor for token injection
- `User` - User model interface

**Usage**:

```typescript
import { inject } from '@angular/core';
import { AuthService, authGuard } from '@mushaviri/data-access-auth';

// In routes
export const routes: Routes = [
  {
    path: 'protected',
    canActivate: [authGuard],
    component: ProtectedComponent,
  },
];

// In component
export class LoginComponent {
  private authService = inject(AuthService);

  login() {
    this.authService.login({ email, password }).subscribe();
  }
}
```

### @mushaviri/ui-common

**Purpose**: Shared UI components

**Exports**:

- `ShellLayoutComponent` - Main layout wrapper
- `NotificationComponent` - Toast notifications
- `BannerComponent` - Banner messages
- `UserMenuComponent` - User menu dropdown
- `NotificationService` - Notification management
- `BannerService` - Banner management

**Usage**:

```typescript
import { NotificationService } from '@mushaviri/ui-common';

export class MyComponent {
  private notificationService = inject(NotificationService);

  showNotification() {
    this.notificationService.show('Success!', 'success');
  }
}
```

### @mushaviri/util-event-bus

**Purpose**: Inter-application communication

**Exports**:

- `EventBusService` - Central event bus
- `AppEvent` - Event model
- Event type constants

**Usage**:

```typescript
import { EventBusService, AppEvent } from '@mushaviri/util-event-bus';

export class RemoteApp {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    // Subscribe to events
    this.eventBus.on('USER_LOGGED_IN').subscribe((event) => {
      console.log('User logged in:', event.payload);
    });

    // Emit events
    this.eventBus.emit({
      type: 'DATA_UPDATED',
      payload: { data: 'value' },
      timestamp: Date.now(),
    });
  }
}
```

### @mushaviri/util-theming

**Purpose**: Application theming

**Exports**:

- `ThemeService` - Theme management
- `Theme` - Theme model
- `THEMES` - Theme configurations

**Usage**:

```typescript
import { ThemeService } from '@mushaviri/util-theming';

export class App {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Set theme from route
    this.router.events.subscribe(() => {
      this.themeService.setThemeFromRoute(this.router.url);
    });

    // Manually set theme
    this.themeService.setTheme('umdzidzisi');
  }
}
```

## Module Federation Configuration

### Federation Manifest

The shell application uses a manifest file to discover remote applications:

**Location**: `apps/shell/<web|admin|client>/public/federation.manifest.json`

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
  "insurance-client": "http://localhost:4209/remoteEntry.json"
}
```

In production, these URLs would point to your deployed remote applications. Each remote application has its own dedicated port for development.

### Loading Remote Modules

Remote applications are loaded using the `loadRemoteModule` function. Here's an example of loading different application types:

```typescript
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  // Umdzidzisi routes
  {
    path: 'umdzidzisi/website',
    loadChildren: () => loadRemoteModule('umdzidzisi-website', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  {
    path: 'umdzidzisi/admin',
    loadChildren: () => loadRemoteModule('umdzidzisi-admin', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  {
    path: 'umdzidzisi/client',
    loadChildren: () => loadRemoteModule('umdzidzisi-client', './Component').then((m) => [{ path: '', component: m.default }]),
  },
  // Similar structure for umtengesi and insurance...
];
```

### Shared Dependencies

Common dependencies (Angular, RxJS, etc.) are shared between applications to avoid duplication:

- Automatically handled by Native Federation
- Singleton services are shared across applications
- Version compatibility is enforced

## Testing

### Unit Tests

```bash
# Run all unit tests
npx nx run-many --target=test

# Run tests for specific project
npx nx test shell

# Run tests with coverage
npx nx test shell --coverage

# Run tests in watch mode
npx nx test shell --watch
```

### E2E Tests

```bash
# Run all e2e tests
npx nx run-many --target=e2e

# Run e2e tests for specific app
npx nx e2e e2e-shell

# Run e2e tests in headed mode
npx nx e2e e2e-shell --headed

# Run e2e tests in UI mode
npx nx e2e e2e-shell --ui
```

### Test Structure

- **Unit Tests**: Located alongside source files (`.spec.ts`)
- **E2E Tests**: Consolidated under `apps/e2e/` (`e2e-*` projects) using Playwright
- **Test Setup**: Vitest for unit tests, Playwright for e2e

## Build and Deployment

### Building Applications

```bash
# Build all applications
npx nx run-many --target=build

# Build specific application (production)
npx nx build shell --configuration=production

# Build specific application (development)
npx nx build shell --configuration=development

# Build with source maps
npx nx build shell --source-map
```

### Build Output

Build artifacts are generated in the `dist/` directory:

```
dist/
├── apps/
│   ├── shell/
│   │   └── browser/              # Shell build output
│   ├── umdzidzisi/
│   │   ├── website/
│   │   │   └── browser/          # Umdzidzisi website build output
│   │   ├── admin/
│   │   │   └── browser/          # Umdzidzisi admin build output
│   │   └── client/
│   │       └── browser/          # Umdzidzisi client build output
│   ├── umtengesi/
│   │   ├── website/
│   │   │   └── browser/          # Umtengesi website build output
│   │   ├── admin/
│   │   │   └── browser/          # Umtengesi admin build output
│   │   └── client/
│   │       └── browser/          # Umtengesi client build output
│   └── insurance/
│       ├── website/
│       │   └── browser/          # Insurance website build output
│       ├── admin/
│       │   └── browser/          # Insurance admin build output
│       └── client/
│           └── browser/          # Insurance client build output
```

### Deployment Strategy

#### Option 1: Independent Deployment

Each application can be deployed to its own domain/subdomain:

```
shell.example.com           → Shell application
umdzidzisi-website.example.com    → Umdzidzisi website
umdzidzisi-admin.example.com      → Umdzidzisi admin
umdzidzisi-client.example.com     → Umdzidzisi client
umtengesi-website.example.com    → Umtengesi website
umtengesi-admin.example.com      → Umtengesi admin
umtengesi-client.example.com     → Umtengesi client
insurance-website.example.com    → Insurance website
insurance-admin.example.com      → Insurance admin
insurance-client.example.com     → Insurance client
```

Update `federation.manifest.json` with production URLs:

```json
{
  "umdzidzisi-website": "https://umdzidzisi-website.example.com/remoteEntry.json",
  "umdzidzisi-admin": "https://umdzidzisi-admin.example.com/remoteEntry.json",
  "umdzidzisi-client": "https://umdzidzisi-client.example.com/remoteEntry.json",
  "umtengesi-website": "https://umtengesi-website.example.com/remoteEntry.json",
  "umtengesi-admin": "https://umtengesi-admin.example.com/remoteEntry.json",
  "umtengesi-client": "https://umtengesi-client.example.com/remoteEntry.json",
  "insurance-website": "https://insurance-website.example.com/remoteEntry.json",
  "insurance-admin": "https://insurance-admin.example.com/remoteEntry.json",
  "insurance-client": "https://insurance-client.example.com/remoteEntry.json"
}
```

#### Option 2: Monolithic Deployment

Deploy all applications together under the same domain:

```
example.com/                      → Shell
example.com/remotes/umdzidzisi-website/ → Umdzidzisi website
example.com/remotes/umdzidzisi-admin/   → Umdzidzisi admin
example.com/remotes/umdzidzisi-client/  → Umdzidzisi client
example.com/remotes/umtengesi-website/ → Umtengesi website
example.com/remotes/umtengesi-admin/   → Umtengesi admin
example.com/remotes/umtengesi-client/  → Umtengesi client
example.com/remotes/insurance-website/ → Insurance website
example.com/remotes/insurance-admin/   → Insurance admin
example.com/remotes/insurance-client/  → Insurance client
```

#### Docker Deployment

```bash
# Use Nx Release for versioning
npx nx release
```

### Environment Configuration

Create environment-specific configuration files:

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  federationManifest: '/assets/federation.manifest.json',
};
```

### Build Optimization

- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Unused code is removed
- **Minification**: Production builds are minified
- **Caching**: Build cache with NX for faster rebuilds

## Useful Commands

```bash
# Development
npm start                                   # Start shell with website remotes
npm run umdzidzisi:website                        # Start shell + umdzidzisi-website
npm run umdzidzisi:admin                          # Start shell + umdzidzisi-admin
npm run umtengesi:client                         # Start shell + umtengesi-client

# Building
npx nx build shell --configuration=production   # Production build
npx nx run-many --target=build                  # Build all projects
npx nx affected --target=build                  # Build affected projects

# Testing
npx nx test shell                           # Unit tests
npx nx e2e shell-e2e                        # E2E tests
npx nx run-many --target=test               # All unit tests

# Code Quality
npx nx lint shell                           # Lint project
npx nx lint shell --fix                     # Lint with auto-fix
npx nx format:write                         # Format code

# Project Management
npx nx graph                                # View dependency graph
npx nx list                                 # List installed plugins
npx nx show project shell --web             # View project details
npx nx affected:graph                       # Show affected projects

# Generators
npx nx g @nx/angular:app my-app             # Generate app
npx nx g @nx/angular:lib my-lib             # Generate library
npx nx g @nx/angular:component my-comp      # Generate component
```

## Learn More

### Architecture & Patterns

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [documentation/ADDING_REMOTE_APPS.md](./documentation/ADDING_REMOTE_APPS.md) - Guide for adding new remote apps

### NX Documentation

- [NX Documentation](https://nx.dev/docs)
- [Angular Monorepo Tutorial](https://nx.dev/docs/getting-started/tutorials/angular-monorepo-tutorial)
- [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)

### Native Federation

- [Native Federation Docs](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/native-federation/README.md)
- [Angular Architects Blog](https://www.angulararchitects.io/en/blog/)

### Angular Resources

- [Angular Documentation](https://angular.dev)
- [Angular Style Guide](https://angular.dev/style-guide)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run `npx nx affected --target=test --target=lint`
5. Submit a pull request

## License

MIT
