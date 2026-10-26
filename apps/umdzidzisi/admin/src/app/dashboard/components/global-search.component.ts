import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EffectRef,
  ElementRef,
  HostListener,
  inject,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { GlobalSearchService } from '@mushaviri/util';
import {
  SEARCH_SCOPES,
  SearchScope,
  SearchScopeId,
} from './search-scope.model';

const DEBOUNCE_MS: number = 250;
/** `GlobalSearchService.placeholder` value when no page has claimed the search. */
const UNCLAIMED_PLACEHOLDER: string = 'Search...';

/**
 * Header global search: a pill with a leading scope selector, the query input,
 * and a ⌘K keycap. The chosen scope (`SearchScopeId`) tells a future data layer
 * which API to call; on submit we emit `{ scope, query }` and navigate to the
 * scope's route with the query as `?q=`.
 *
 * Typing is also mirrored (debounced) into `GlobalSearchService`, so a routed
 * page that consumes it (e.g. Users, Roles) filters live as the user types and
 * its placeholder replaces the scope's while that page is active.
 */
@Component({
  selector: 'org-global-search',
  standalone: true,
  imports: [OverlayModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent {
  private readonly router: Router = inject(Router);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);

  /** Emitted on submit so a future service can run the actual search. */
  public readonly searched: OutputEmitterRef<{
    scope: SearchScopeId;
    query: string;
  }> = output<{ scope: SearchScopeId; query: string }>();

  protected readonly scopes: SearchScope[] = SEARCH_SCOPES;

  /** Currently selected scope (defaults to "All"). */
  protected readonly selectedScope: WritableSignal<SearchScope> = signal(
    SEARCH_SCOPES[0],
  );

  /** Whether the scope dropdown is open. */
  protected readonly isScopeOpen: WritableSignal<boolean> = signal(false);

  /** A page's own placeholder wins; otherwise it tracks the selected scope. */
  protected readonly placeholder: Signal<string> = computed(() => {
    const pagePlaceholder: string = this.globalSearch.placeholder();
    return pagePlaceholder !== UNCLAIMED_PLACEHOLDER
      ? pagePlaceholder
      : this.selectedScope().placeholder;
  });

  /**
   * Mirrors what's typed immediately; `globalSearch.query` updates debounced.
   * Re-synced when `query` changes from outside (e.g. a page resetting it on
   * destroy), so navigating away clears the input too.
   */
  protected readonly term: WritableSignal<string> = signal('');

  private debounceHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly syncFromQuery: EffectRef = effect((): void => {
    this.term.set(this.globalSearch.query());
  });

  private readonly searchInput: Signal<
    ElementRef<HTMLInputElement> | undefined
  > = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Platform-aware shortcut label ("⌘K" on Mac, else "Ctrl K"). */
  protected readonly shortcutLabel: string = GlobalSearchComponent.isMac()
    ? '⌘K'
    : 'Ctrl K';

  private static isMac(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const platform: string =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent;
    return /mac|iphone|ipad|ipod/i.test(platform);
  }

  protected toggleScope(): void {
    this.isScopeOpen.update((open: boolean) => !open);
  }

  protected closeScope(): void {
    this.isScopeOpen.set(false);
  }

  protected selectScope(scope: SearchScope): void {
    this.selectedScope.set(scope);
    this.closeScope();
    this.searchInput()?.nativeElement.focus();
  }

  protected isActive(scope: SearchScope): boolean {
    return scope.id === this.selectedScope().id;
  }

  /** Enter submits: emit the scope+query and route to the scope with `?q=`. */
  protected onSubmit(): void {
    // A page consuming the live query is already filtering — don't navigate away.
    if (this.globalSearch.placeholder() !== UNCLAIMED_PLACEHOLDER) {
      return;
    }
    const query: string = (
      this.searchInput()?.nativeElement.value ?? ''
    ).trim();
    if (!query) {
      return;
    }
    const scope: SearchScope = this.selectedScope();
    this.searched.emit({ scope: scope.id, query });
    this.router.navigate([scope.route], { queryParams: { q: query } });
  }

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

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    } else if (event.key === 'Escape') {
      this.searchInput()?.nativeElement.blur();
    }
  }

  /** ⌘K / Ctrl+K focuses the search from anywhere on the page. */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    }
  }

  protected trackByScope(_index: number, scope: SearchScope): string {
    return scope.id;
  }
}
