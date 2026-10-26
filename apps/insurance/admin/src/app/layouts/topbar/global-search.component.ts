import {
  ChangeDetectionStrategy,
  Component,
  EffectRef,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { GlobalSearchService } from '@mushaviri/util';

const DEBOUNCE_MS: number = 250;

/**
 * Header global search: a single input with a leading search icon, backed by
 * `GlobalSearchService` so whichever routed page is active can consume what's
 * typed here (see `GlobalSearchService` for why a shared service is needed
 * instead of an `@Input`/`@Output`). Simplified for v1 — no scope-selector
 * dropdown, no ⌘K overlay (not in the design).
 */
@Component({
  selector: 'org-global-search',
  standalone: true,
  templateUrl: './global-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent {
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);

  protected readonly placeholder: Signal<string> =
    this.globalSearch.placeholder;

  /**
   * Mirrors what's typed immediately; `globalSearch.query` updates debounced.
   * Also re-synced whenever `query` changes from outside this component (e.g.
   * a page resetting it on destroy), so navigating away clears the input too.
   */
  protected readonly term: WritableSignal<string> = signal('');

  private debounceHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly syncFromQuery: EffectRef = effect((): void => {
    this.term.set(this.globalSearch.query());
  });

  protected onInput(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.term.set(value);
    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }
    this.debounceHandle = setTimeout((): void => {
      this.globalSearch.query.set(value);
    }, DEBOUNCE_MS);
  }
}
