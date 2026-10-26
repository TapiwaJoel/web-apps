import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ArticleResponseDto,
  ArticleStatus,
  ArticlesStore,
} from '@mushaviri/api';
import { StatusPillComponent, StatusTone } from '@mushaviri/ui';

const SEARCH_DEBOUNCE_MS: number = 300;
const MAX_RESULTS: number = 50;

const ARTICLE_STATUS_TONES: Record<ArticleStatus, StatusTone> = {
  [ArticleStatus.PUBLISHED]: 'success',
  [ArticleStatus.DRAFT]: 'info',
  [ArticleStatus.ARCHIVED]: 'warning',
  [ArticleStatus.DELETED]: 'error',
};

let nextPickerId: number = 0;

/**
 * Searchable combobox over CMS articles. Emits the selected article `id`.
 */
@Component({
  selector: 'org-article-picker',
  standalone: true,
  imports: [FormsModule, OverlayModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-picker.component.html',
})
export class ArticlePickerComponent {
  // Injected services
  private readonly articlesStore: InstanceType<typeof ArticlesStore> =
    inject(ArticlesStore);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly hostRef: ElementRef<HTMLElement> = inject(ElementRef);

  // State
  protected readonly ARTICLE_STATUS_TONES: Record<ArticleStatus, StatusTone> =
    ARTICLE_STATUS_TONES;
  protected readonly pickerId: string = `article-picker-${nextPickerId++}`;
  protected readonly open: WritableSignal<boolean> = signal(false);
  protected readonly query: WritableSignal<string> = signal('');
  protected readonly activeIndex: WritableSignal<number> = signal(-1);
  protected readonly panelWidth: WritableSignal<number> = signal(0);
  private readonly requestedIds: Set<string> = new Set<string>();

  // Inputs
  public readonly value: InputSignal<string | null> = input<string | null>(
    null,
  );
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly label: InputSignal<string> = input<string>('Article');

  // Outputs
  public readonly valueChange: OutputEmitterRef<string> = output<string>();

  // Computed
  protected readonly articlesLoading: Signal<boolean> =
    this.articlesStore.articlesLoading;
  protected readonly articlesError: Signal<string | null> =
    this.articlesStore.articlesError;

  protected readonly selected: Signal<ArticleResponseDto | null> = computed(
    (): ArticleResponseDto | null => {
      const id: string | null = this.value();
      if (!id) {
        return null;
      }
      return (
        this.articlesStore
          .articles()
          .find((article: ArticleResponseDto) => article.id === id) ?? null
      );
    },
  );

  protected readonly displayText: Signal<string> = computed((): string => {
    if (this.open()) {
      return this.query();
    }
    const id: string | null = this.value();
    return this.selected()?.title ?? id ?? '';
  });

  protected readonly results: Signal<ArticleResponseDto[]> = computed(
    (): ArticleResponseDto[] => {
      const term: string = this.query().trim().toLowerCase();
      return this.articlesStore
        .articles()
        .filter(
          (article: ArticleResponseDto) =>
            article.status !== ArticleStatus.DELETED &&
            (!term || article.title.toLowerCase().includes(term)),
        )
        .slice(0, MAX_RESULTS);
    },
  );

  public constructor() {
    this.articlesStore.loadArticles();

    toObservable(this.query)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string): void => {
        const title: string = term.trim();
        if (title) {
          this.articlesStore.loadArticles({ title });
        }
      });

    // The current value may not be in the (possibly paginated) store yet.
    effect((): void => {
      const id: string | null = this.value();
      if (
        !id ||
        this.articlesStore.articlesLoading() ||
        this.selected() ||
        this.requestedIds.has(id)
      ) {
        return;
      }
      this.requestedIds.add(id);
      this.articlesStore.loadArticles({ _id: id });
    });
  }

  // Public methods
  public optionId(index: number): string {
    return `${this.pickerId}-option-${index}`;
  }

  public openPanel(): void {
    if (this.disabled() || this.open()) {
      return;
    }
    const field: HTMLElement | null = this.hostRef.nativeElement.querySelector(
      '[data-combobox-field]',
    );
    this.panelWidth.set(field?.getBoundingClientRect().width ?? 0);
    this.query.set('');
    this.activeIndex.set(this.selectedIndex());
    this.open.set(true);
  }

  public closePanel(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  public onQueryChange(term: string): void {
    if (!this.open()) {
      this.openPanel();
    }
    this.query.set(term);
    this.activeIndex.set(this.results().length > 0 ? 0 : -1);
  }

  public onKeydown(event: KeyboardEvent): void {
    const count: number = this.results().length;
    const current: number = this.activeIndex();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
          return;
        }
        this.setActive(Math.min(count - 1, current + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
          return;
        }
        this.setActive(Math.max(0, current - 1));
        break;
      case 'Home':
        if (this.open() && count > 0) {
          event.preventDefault();
          this.setActive(0);
        }
        break;
      case 'End':
        if (this.open() && count > 0) {
          event.preventDefault();
          this.setActive(count - 1);
        }
        break;
      case 'Enter': {
        if (!this.open()) {
          return;
        }
        const article: ArticleResponseDto | undefined = this.results()[current];
        if (article) {
          event.preventDefault();
          this.choose(article);
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.closePanel();
        }
        break;
      case 'Tab':
        this.closePanel();
        break;
    }
  }

  public onOutsideClick(event: MouseEvent): void {
    const target: Node | null = event.target as Node | null;
    if (target && this.hostRef.nativeElement.contains(target)) {
      return;
    }
    this.closePanel();
  }

  public choose(article: ArticleResponseDto): void {
    this.valueChange.emit(article.id);
    this.closePanel();
  }

  // Private methods
  private selectedIndex(): number {
    const id: string | null = this.value();
    return id
      ? this.results().findIndex(
          (article: ArticleResponseDto) => article.id === id,
        )
      : -1;
  }

  private setActive(index: number): void {
    if (index < 0) {
      return;
    }
    this.activeIndex.set(index);
    document
      .getElementById(this.optionId(index))
      ?.scrollIntoView({ block: 'nearest' });
  }
}
