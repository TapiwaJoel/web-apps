#!/usr/bin/env node
/**
 * Resilient dev supervisor for the native-federation dev servers.
 *
 * A tenant command (e.g. `umdzidzisi:admin`) runs two dev servers: the shell
 * host + one remote. The native-federation dev server can crash or silently
 * wedge after a few rebuilds (especially when editing shared libs), and nothing
 * brings it back. This supervisor:
 *
 *   - remembers the EXACT tenant target it was launched with, so restarts never
 *     mix apps (it always re-runs the same projects + nx configuration);
 *   - runs each app as its own child process, so one crash never takes the other
 *     down;
 *   - restarts an app on unexpected exit (crash) with exponential backoff;
 *   - restarts an app on wedge — detected by an HTTP health-check against its
 *     port when the process is alive but stops responding;
 *   - cleans up only THIS target's ports on start and on shutdown, so it never
 *     kills an unrelated tenant's servers.
 *
 * Usage:
 *   node tools/scripts/dev.mjs umdzidzisi:admin
 */

import { spawn, execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { request } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '../..');

/**
 * Tenant targets → the exact projects, nx configuration, and ports they serve.
 * This map is the single source of truth that keeps restarts from mixing apps.
 * A project's `health` path is what the wedge health-check polls.
 */
const TARGETS = {
  'umdzidzisi:admin': {
    config: 'umdzidzisi',
    apps: [
      { project: 'shell-admin', port: 4200, health: '/' },
      { project: 'umdzidzisi-admin', port: 4203, health: '/remoteEntry.json' },
    ],
  },
  'umtengesi:admin': {
    config: 'umtengesi',
    apps: [
      { project: 'shell-admin', port: 4200, health: '/' },
      { project: 'umtengesi-admin', port: 4204, health: '/remoteEntry.json' },
    ],
  },
  'umdzidzisi:website': {
    config: 'umdzidzisi',
    apps: [
      { project: 'shell-web', port: 4200, health: '/' },
      { project: 'umdzidzisi-website', port: 4201, health: '/remoteEntry.json' },
    ],
  },
  'umtengesi:website': {
    config: 'umtengesi',
    apps: [
      { project: 'shell-web', port: 4200, health: '/' },
      { project: 'umtengesi-website', port: 4202, health: '/remoteEntry.json' },
    ],
  },
  'umdzidzisi:client': {
    config: 'umdzidzisi',
    apps: [
      { project: 'shell-client', port: 4200, health: '/' },
      { project: 'umdzidzisi-client', port: 4205, health: '/remoteEntry.json' },
    ],
  },
  'umtengesi:client': {
    config: 'umtengesi',
    apps: [
      { project: 'shell-client', port: 4200, health: '/' },
      { project: 'umtengesi-client', port: 4206, health: '/remoteEntry.json' },
    ],
  },
};

// --- Tuning knobs ------------------------------------------------------------
const HEALTH_INTERVAL_MS = 4000; // how often to poll each app's health URL
const HEALTH_TIMEOUT_MS = 3000; // per-probe timeout
const HEALTH_START_GRACE_MS = 45000; // don't health-check an app until it's had time to boot
const WEDGE_FAILS = 4; // consecutive failed probes ⇒ treat as wedged and restart
const BACKOFF_MS = [1000, 2000, 5000, 10000]; // restart backoff, capped at the last value
const HEALTHY_RESET_MS = 20000; // app healthy this long ⇒ reset its backoff counter

const target = process.argv[2];
if (!target || !TARGETS[target]) {
  console.error(`❌ Unknown or missing dev target: ${target ?? '(none)'}`);
  console.error(`Available targets: ${Object.keys(TARGETS).join(', ')}`);
  process.exit(1);
}

const { config, apps } = TARGETS[target];
let shuttingDown = false;

/** Free a single port (best-effort; never throws). */
function freePort(port) {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: 'ignore',
      shell: '/bin/bash',
    });
  } catch {
    // ignore — port was already free
  }
}

/** HTTP health probe: resolves true if the port answers with any HTTP status. */
function probe(port, path) {
  return new Promise((resolve) => {
    const req = request(
      { host: 'localhost', port, path, method: 'HEAD', timeout: HEALTH_TIMEOUT_MS },
      (res) => {
        res.resume(); // drain
        resolve(true);
      },
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Runtime state per app: the child process, restart bookkeeping, and the
 * health poller. Each app supervises itself independently.
 */
const runtime = new Map();

function nxServeArgs(project) {
  // `npx nx serve <project> [--configuration <config>]`
  const args = ['nx', 'serve', project];
  if (config) {
    args.push('--configuration', config);
  }
  return args;
}

/**
 * Kill an app's entire process group. `nx serve` spawns the real dev server as a
 * grandchild; killing only the `npx` wrapper would orphan it and leave the port
 * bound. Because each child is spawned `detached` it leads its own process group,
 * so a negative-PID signal reaps the whole tree at once — no racy kill-by-port.
 */
function killTree(child, signal) {
  if (!child || child.killed) {
    return;
  }
  try {
    process.kill(-child.pid, signal); // negative pid ⇒ whole process group
  } catch {
    try {
      child.kill(signal); // fall back to just the wrapper
    } catch {
      // already gone
    }
  }
}

function startApp(app) {
  const state = runtime.get(app.project);

  // Only clear the port on the very first boot (to sweep a stale server from a
  // previous session). On restarts, killTree() has already freed it — probing by
  // port here could catch an unrelated/sibling process mid-race.
  if (!state.booted) {
    freePort(app.port);
    state.booted = true;
  }

  console.log(`▶️  starting ${app.project} on :${app.port}`);
  const child = spawn('npx', nxServeArgs(app.project), {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: false,
    detached: true, // own process group ⇒ killTree() can reap nx + dev-server
    env: process.env,
  });
  state.child = child;
  state.startedAt = Date.now();
  state.failCount = 0;

  child.on('exit', (code, signal) => {
    state.child = null;
    if (shuttingDown || state.restarting) {
      return; // intentional (shutdown or wedge-kill) — restart handled elsewhere
    }
    console.warn(
      `⚠️  ${app.project} exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`,
    );
    scheduleRestart(app, 'crash');
  });
}

function scheduleRestart(app, reason) {
  const state = runtime.get(app.project);
  if (shuttingDown || state.restarting) {
    return;
  }
  state.restarting = true;

  // Reset backoff if the app had been healthy for a while before dying.
  if (Date.now() - state.startedAt > HEALTHY_RESET_MS) {
    state.restartAttempt = 0;
  }
  const delay = BACKOFF_MS[Math.min(state.restartAttempt, BACKOFF_MS.length - 1)];
  state.restartAttempt += 1;

  console.log(
    `🔁 restarting ${app.project} in ${delay}ms (reason: ${reason}, attempt ${state.restartAttempt})`,
  );

  const relaunch = () => {
    setTimeout(() => {
      state.restarting = false;
      startApp(app);
    }, delay);
  };

  if (state.child) {
    // Wedge case (process still alive): reap the whole tree, then relaunch once
    // it has exited. Also free the port after exit as a belt-and-braces measure.
    state.child.once('exit', () => {
      freePort(app.port);
      relaunch();
    });
    killTree(state.child, 'SIGKILL');
    return;
  }

  relaunch();
}

async function healthLoop(app) {
  const state = runtime.get(app.project);
  while (!shuttingDown) {
    await sleep(HEALTH_INTERVAL_MS);
    if (shuttingDown || state.restarting || !state.child) {
      continue;
    }
    // Give a freshly (re)started app time to boot before probing.
    if (Date.now() - state.startedAt < HEALTH_START_GRACE_MS) {
      continue;
    }
    const ok = await probe(app.port, app.health);
    if (ok) {
      state.failCount = 0;
      continue;
    }
    state.failCount += 1;
    console.warn(
      `🩺 ${app.project} health check failed (${state.failCount}/${WEDGE_FAILS}) on :${app.port}${app.health}`,
    );
    if (state.failCount >= WEDGE_FAILS) {
      console.error(`🚑 ${app.project} appears wedged — forcing restart`);
      scheduleRestart(app, 'wedge');
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log('\n🛑 shutting down dev servers…');
  for (const app of apps) {
    const state = runtime.get(app.project);
    killTree(state?.child, 'SIGTERM');
    freePort(app.port);
  }
  // Give children a moment to exit, then hard-exit.
  setTimeout(() => process.exit(0), 500);
}

// --- Boot --------------------------------------------------------------------
console.log(`🚀 dev supervisor: ${target} (config: ${config})`);
console.log(
  `   apps: ${apps.map((a) => `${a.project}@${a.port}`).join(', ')}`,
);

for (const app of apps) {
  runtime.set(app.project, {
    child: null,
    startedAt: 0,
    failCount: 0,
    restartAttempt: 0,
    restarting: false,
    booted: false,
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const app of apps) {
  startApp(app);
  healthLoop(app);
}
