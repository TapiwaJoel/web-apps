import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Bridges the topbar's global search input to whichever routed page wants to
 * consume it. The topbar and the routed page are template siblings (neither
 * is the other's parent), so this singleton is the connector: a page injects
 * it, sets `placeholder`, and folds `query()` into its own filtering — then
 * resets both on destroy so the next page doesn't inherit a stale filter.
 */
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  public readonly query: WritableSignal<string> = signal('');
  public readonly placeholder: WritableSignal<string> = signal('Search...');
}
