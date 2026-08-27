# Playwright UI Mode Testing Guide

## Overview

Playwright offers multiple execution modes for e2e testing, including visual interfaces similar to Cypress. This guide explains how to use Playwright's UI capabilities in this Nx monorepo workspace.

## Playwright Execution Modes

### 1. Headless Mode (Default)

- No browser window shown
- Runs in background
- Fastest execution
- Ideal for CI/CD pipelines
- **This is the default mode** used by your npm scripts and Nx commands

### 2. Headed Mode

- Browser window visible during test execution
- See tests running in real-time
- Useful for debugging and watching test behavior
- Add `--headed` flag to any Playwright command

### 3. UI Mode (Interactive Test Runner)

- **Most similar to Cypress UI**
- Visual timeline of test execution
- Click to step through test actions
- Inspect DOM at any point in time
- View network requests and console logs
- Watch mode - automatically reruns tests on file changes
- Time-travel debugging
- Add `--ui` flag to any Playwright command

### 4. Debug Mode (Step-Through Debugging)

- Playwright Inspector opens automatically
- Set breakpoints in test code
- Step through test execution line-by-line
- Inspect page state at each step
- Add `--debug` flag to any Playwright command

## Important: Dev Server Requirement

### The Problem

When running Playwright UI mode (or any mode) with `npx playwright test --ui` directly from an e2e project directory, you may encounter this error:

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"
```

### Why This Happens

- Each e2e project's `playwright.config.mts` defines a `baseURL` (e.g., `http://localhost:4200`)
- Playwright tries to navigate to this URL when running tests
- If the dev server isn't running, the URL is unreachable
- In this workspace, we deliberately **removed** the `webServer` configuration from Playwright configs to follow Nx best practices
- Instead, Nx manages dev servers via the `dependsOn` relationship in project configurations

### The Solutions

You have three approaches to run Playwright with the dev server:

## Solution 1: Use Nx with --ui Flag (Recommended)

Nx automatically starts the dev server before running tests via the `dependsOn` configuration. Pass the `--ui` flag through Nx to Playwright:

```bash
# From workspace root
nx e2e e2e-shell -- --ui
nx e2e umdzidzisi-website-e2e -- --ui
nx e2e umdzidzisi-admin-e2e -- --ui
nx e2e umdzidzisi-client-e2e -- --ui
nx e2e umtengesi-website-e2e -- --ui
nx e2e umtengesi-admin-e2e -- --ui
nx e2e umtengesi-client-e2e -- --ui
nx e2e insurance-website-e2e -- --ui
nx e2e insurance-admin-e2e -- --ui
nx e2e insurance-client-e2e -- --ui
```

**Advantages:**

- Nx handles dev server lifecycle automatically
- Single command
- Works in CI/CD without modifications
- Leverages Nx caching and dependency graph

**Note:** The `--` separator passes the `--ui` flag from Nx to Playwright.

## Solution 2: Start Dev Server Manually

Run the dev server in one terminal, then Playwright UI in another:

```bash
# Terminal 1: Start dev server
nx serve shell
# or use npm script
npm run shell:serve

# Terminal 2: Run Playwright UI
cd apps/e2e/shell
npx playwright test --ui
```

**Advantages:**

- More control over dev server
- Can inspect dev server logs separately
- Useful for debugging server-side issues

**Disadvantages:**

- Requires managing two terminals
- Must remember to start server first

## Solution 3: Add npm Scripts for UI Mode

You can add convenient npm scripts to `package.json` that combine Nx and the UI flag:

```json
{
  "scripts": {
    "e2e:shell:ui": "nx e2e e2e-shell -- --ui",
    "e2e:umdzidzisi:website:ui": "nx e2e umdzidzisi-website-e2e -- --ui",
    "e2e:umdzidzisi:admin:ui": "nx e2e umdzidzisi-admin-e2e -- --ui",
    "e2e:umdzidzisi:client:ui": "nx e2e umdzidzisi-client-e2e -- --ui",
    "e2e:umtengesi:website:ui": "nx e2e umtengesi-website-e2e -- --ui",
    "e2e:umtengesi:admin:ui": "nx e2e umtengesi-admin-e2e -- --ui",
    "e2e:umtengesi:client:ui": "nx e2e umtengesi-client-e2e -- --ui",
    "e2e:insurance:website:ui": "nx e2e insurance-website-e2e -- --ui",
    "e2e:insurance:admin:ui": "nx e2e insurance-admin-e2e -- --ui",
    "e2e:insurance:client:ui": "nx e2e insurance-client-e2e -- --ui"
  }
}
```

Then run:

```bash
npm run e2e:shell:ui
npm run e2e:umdzidzisi:website:ui
# etc.
```

**Advantages:**

- Easy to remember and type
- Consistent with existing npm script patterns
- Team members don't need to remember Nx syntax
- Can add additional flags or configuration

## Using Headed and Debug Modes

The same approaches work for other Playwright modes:

### Headed Mode (Browser Visible)

```bash
# Via Nx
nx e2e e2e-shell -- --headed

# Or add to package.json
"e2e:shell:headed": "nx e2e e2e-shell -- --headed"
```

### Debug Mode (Step-Through)

```bash
# Via Nx
nx e2e e2e-shell -- --debug

# Or add to package.json
"e2e:shell:debug": "nx e2e e2e-shell -- --debug"
```

### Combine Flags

```bash
# UI mode with headed browsers
nx e2e e2e-shell -- --ui --headed

# Run specific test file in debug mode
nx e2e e2e-shell -- --debug src/example.spec.ts
```

## Comparison with Cypress

If you're coming from Cypress, here's how Playwright UI mode compares:

| Feature               | Cypress         | Playwright UI Mode               |
| --------------------- | --------------- | -------------------------------- |
| Visual test runner    | ✅ Cypress UI   | ✅ Playwright UI                 |
| Watch mode            | ✅ Auto-reruns  | ✅ Auto-reruns                   |
| Time-travel debugging | ✅ Step through | ✅ Timeline with snapshots       |
| DOM inspection        | ✅ Built-in     | ✅ Built-in                      |
| Network inspection    | ✅ Via UI       | ✅ Via UI                        |
| Console logs          | ✅ Visible      | ✅ Visible                       |
| Multi-browser testing | ⚠️ Limited      | ✅ Chrome, Firefox, Safari, Edge |
| Parallel execution    | 💰 Paid feature | ✅ Free with Nx                  |
| CI integration        | ✅ Good         | ✅ Excellent with Nx             |

## Dev Server Port Reference

This workspace uses the following dev server ports:

| Application        | Port |
| ------------------ | ---- |
| shell              | 4200 |
| umdzidzisi-website | 4201 |
| umtengesi-website  | 4202 |
| umdzidzisi-admin   | 4203 |
| umtengesi-admin    | 4204 |
| umdzidzisi-client  | 4205 |
| umtengesi-client   | 4206 |
| insurance-website  | 4207 |
| insurance-admin    | 4208 |
| insurance-client   | 4209 |

## Troubleshooting

### Error: Cannot navigate to invalid URL

**Cause:** Dev server is not running.

**Solution:** Use Solution 1 (Nx with --ui) or Solution 2 (start server manually).

### Error: Port already in use

**Cause:** Dev server from previous run still running.

**Solution:**

```bash
# Kill all dev servers
npm run stop

# Or manually kill specific port
lsof -ti :4200 | xargs kill -9
```

### Tests pass in headless but fail in UI mode

**Cause:** Timing differences or race conditions exposed by slower rendering.

**Solution:**

- Check for hard-coded waits (`page.waitForTimeout`)
- Use Playwright's built-in waiting mechanisms (`waitForSelector`, `waitForLoadState`)
- Review auto-waiting behavior in Playwright docs

### UI mode doesn't show any tests

**Cause:** Playwright can't find test files.

**Solution:**

- Ensure you're in the correct e2e project directory
- Check `testDir` in `playwright.config.mts` (should be `'./src'`)
- Verify test files match pattern `**/*.spec.ts`

### Nx cache causes outdated results

**Cause:** Nx caches test results for performance.

**Solution:**

```bash
# Clear Nx cache
npx nx reset

# Run tests without cache
nx e2e e2e-shell --skip-nx-cache
```

## Running Individual Tests in UI Mode

When Playwright UI opens:

1. **File explorer** shows all test files
2. **Click any test** to run it individually
3. **Click project icon** (chromium/firefox/webkit) to run on specific browser
4. **Use filters** at top to search tests
5. **Watch mode toggle** automatically reruns on file changes

## Best Practices

1. **Use UI mode for development** - Visual feedback helps catch issues early
2. **Use headless mode for CI** - Faster and doesn't require display
3. **Use debug mode for complex issues** - Step through problematic tests
4. **Leverage watch mode** - Make changes and see results immediately
5. **Run via Nx** - Ensures dev servers start automatically

## Additional Resources

- [Playwright UI Mode Documentation](https://playwright.dev/docs/test-ui-mode)
- [Playwright Inspector Documentation](https://playwright.dev/docs/debug)
- [Nx Playwright Plugin Documentation](https://nx.dev/nx-api/playwright)
- [IntelliJ Setup Guide](.idea/PLAYWRIGHT_SETUP.md) - For IDE integration

## Quick Reference

```bash
# Headless (default)
npm run e2e:shell
nx e2e e2e-shell

# UI Mode (interactive)
nx e2e e2e-shell -- --ui

# Headed (show browser)
nx e2e e2e-shell -- --headed

# Debug (step-through)
nx e2e e2e-shell -- --debug

# Specific test file
nx e2e e2e-shell -- src/login.spec.ts --ui

# Multiple flags
nx e2e e2e-shell -- --ui --headed --project=chromium
```
