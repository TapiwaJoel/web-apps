const RELOAD_FLAG: string = 'dev-stale-chunk-reload';

/**
 * In dev serve, a long-idle tab can end up holding a shell chunk from a
 * previous rebuild generation. esbuild/Vite only substitute the `ngDevMode`
 * global at build time (no runtime fallback exists in Angular core), so a
 * stale chunk that missed the current generation's substitution throws
 * `ReferenceError: ngDevMode is not defined` the first time it runs — this
 * mirrors the existing loadRemoteModule dev-recovery in shell app.routes.ts,
 * but for errors thrown outside that call (e.g. shell-local DI construction).
 */
function isStaleChunkError(reason: unknown): boolean {
  const message: string =
    reason instanceof Error ? reason.message : String(reason);
  return /ngDevMode is not defined/.test(message);
}

function recoverOnce(reason: unknown): void {
  if (!isStaleChunkError(reason)) {
    return;
  }
  if (sessionStorage.getItem(RELOAD_FLAG)) {
    return;
  }
  sessionStorage.setItem(RELOAD_FLAG, '1');
  console.warn(
    '[dev] stale chunk detected after idle — reloading once to recover',
    reason,
  );
  location.reload();
}

/**
 * Installs a dev-only recovery listener for stale-chunk errors surfacing
 * outside the remote-loading path. Call once at bootstrap; a no-op in
 * production so behavior there is unchanged.
 */
export function installDevStaleChunkRecovery(production: boolean): void {
  if (production) {
    return;
  }
  window.addEventListener('error', (event: ErrorEvent) =>
    recoverOnce(event.error ?? event.message),
  );
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => recoverOnce(event.reason),
  );
}

/**
 * Call once the app has bootstrapped successfully, so a later idle-triggered
 * stale chunk is treated as a fresh occurrence rather than being suppressed
 * by a flag left over from a previous reload.
 */
export function clearDevStaleChunkFlag(production: boolean): void {
  if (production) {
    return;
  }
  sessionStorage.removeItem(RELOAD_FLAG);
}
