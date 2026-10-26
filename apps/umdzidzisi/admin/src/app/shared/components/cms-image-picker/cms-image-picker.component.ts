import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AnyResourceResponseDto,
  FileType,
  ResourcesService,
  ResourcesStore,
} from '@mushaviri/api';
import { NotificationService } from '@mushaviri/ui';

const SEARCH_DEBOUNCE_MS: number = 300;
const GRID_COLUMNS: number = 3;

let nextPickerId: number = 0;

/**
 * Picks a CMS image resource: shows a thumbnail of the current value, uploads
 * a new image, or chooses an existing one from a searchable grid. Emits the
 * resource `_id`.
 */
@Component({
  selector: 'org-cms-image-picker',
  standalone: true,
  imports: [FormsModule, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cms-image-picker.component.html',
})
export class CmsImagePickerComponent {
  // Injected services
  private readonly resourcesStore: InstanceType<typeof ResourcesStore> =
    inject(ResourcesStore);
  private readonly resourcesService: ResourcesService =
    inject(ResourcesService);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  // State
  protected readonly pickerId: string = `cms-image-picker-${nextPickerId++}`;
  protected readonly uploading: WritableSignal<boolean> = signal(false);
  protected readonly panelOpen: WritableSignal<boolean> = signal(false);
  protected readonly searchTerm: WritableSignal<string> = signal('');
  protected readonly activeIndex: WritableSignal<number> = signal(-1);
  protected readonly previewFailed: WritableSignal<boolean> = signal(false);

  // Inputs
  public readonly value: InputSignal<string | null> = input<string | null>(
    null,
  );
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  // Outputs
  public readonly valueChange: OutputEmitterRef<string> = output<string>();

  // View queries
  private readonly fileInput: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly searchInput: Signal<
    ElementRef<HTMLInputElement> | undefined
  > = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Computed
  protected readonly resourcesLoading: Signal<boolean> =
    this.resourcesStore.resourcesLoading;
  protected readonly resourcesError: Signal<string | null> =
    this.resourcesStore.resourcesError;

  protected readonly previewUrl: Signal<string | null> = computed(
    (): string | null => {
      const id: string | null = this.value();
      return id ? this.thumbnailUrl(id) : null;
    },
  );

  protected readonly selectedName: Signal<string | null> = computed(
    (): string | null => {
      const id: string | null = this.value();
      if (!id) {
        return null;
      }
      const match: AnyResourceResponseDto | undefined = this.resourcesStore
        .resources()
        .find((resource: AnyResourceResponseDto) => resource._id === id);
      return match?.name ?? null;
    },
  );

  protected readonly images: Signal<AnyResourceResponseDto[]> = computed(
    (): AnyResourceResponseDto[] => {
      const term: string = this.searchTerm().trim().toLowerCase();
      return this.resourcesStore
        .resources()
        .filter(
          (resource: AnyResourceResponseDto) =>
            resource.type === FileType.IMAGE &&
            (!term || resource.name.toLowerCase().includes(term)),
        );
    },
  );

  public constructor() {
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string): void => {
        const name: string = term.trim();
        if (name) {
          this.resourcesStore.loadResources({ type: FileType.IMAGE, name });
        }
      });

    // Reset the broken-preview flag whenever the value changes.
    toObservable(this.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        this.previewFailed.set(false);
      });
  }

  // Public methods
  /**
   * The CMS only serves `thumbnail=true` for videos (images get
   * `InvalidThumbnailRequestException`), so image previews stream the image itself.
   */
  public thumbnailUrl(id: string): string {
    return this.resourcesService.contentUrl(id);
  }

  public optionId(index: number): string {
    return `${this.pickerId}-option-${index}`;
  }

  public openFileDialog(): void {
    if (this.disabled() || this.uploading()) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  public onFileSelected(event: Event): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | undefined = target.files?.[0];
    target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.notificationService.show({
        type: 'error',
        title: 'Unsupported file',
        message: 'Please choose an image file.',
      });
      return;
    }

    this.uploading.set(true);
    this.resourcesStore.uploadResources([file], {
      next: (uploaded: AnyResourceResponseDto[]): void => {
        this.uploading.set(false);
        const resource: AnyResourceResponseDto | undefined = uploaded[0];
        if (!resource) {
          this.notificationService.show({
            type: 'error',
            title: 'Upload failed',
            message: 'The server did not return the uploaded image.',
          });
          return;
        }
        this.valueChange.emit(resource._id);
        this.notificationService.show({
          type: 'success',
          message: `Uploaded ${resource.name}.`,
        });
      },
      error: (message: string): void => {
        this.uploading.set(false);
        this.notificationService.show({
          type: 'error',
          title: 'Upload failed',
          message,
        });
      },
    });
  }

  public togglePanel(): void {
    if (this.panelOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  public openPanel(): void {
    if (this.disabled()) {
      return;
    }
    this.resourcesStore.loadResources();
    this.searchTerm.set('');
    this.activeIndex.set(this.selectedIndex());
    this.panelOpen.set(true);
    setTimeout((): void => {
      this.searchInput()?.nativeElement.focus();
    });
  }

  public closePanel(): void {
    this.panelOpen.set(false);
    this.activeIndex.set(-1);
  }

  public onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.activeIndex.set(this.images().length > 0 ? 0 : -1);
  }

  public onSearchKeydown(event: KeyboardEvent): void {
    const count: number = this.images().length;
    const current: number = this.activeIndex();
    switch (event.key) {
      case 'ArrowRight':
        this.moveActive(current + 1, count, event);
        break;
      case 'ArrowLeft':
        this.moveActive(current - 1, count, event);
        break;
      case 'ArrowDown':
        this.moveActive(current < 0 ? 0 : current + GRID_COLUMNS, count, event);
        break;
      case 'ArrowUp':
        this.moveActive(current - GRID_COLUMNS, count, event);
        break;
      case 'Home':
        this.moveActive(0, count, event);
        break;
      case 'End':
        this.moveActive(count - 1, count, event);
        break;
      case 'Enter': {
        const resource: AnyResourceResponseDto | undefined =
          this.images()[current];
        if (resource) {
          event.preventDefault();
          this.choose(resource);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.closePanel();
        break;
    }
  }

  public choose(resource: AnyResourceResponseDto): void {
    this.valueChange.emit(resource._id);
    this.closePanel();
  }

  public onPreviewError(): void {
    this.previewFailed.set(true);
  }

  // Private methods
  private selectedIndex(): number {
    const id: string | null = this.value();
    return id
      ? this.images().findIndex(
          (resource: AnyResourceResponseDto) => resource._id === id,
        )
      : -1;
  }

  private moveActive(next: number, count: number, event: KeyboardEvent): void {
    if (count === 0) {
      return;
    }
    event.preventDefault();
    const clamped: number = Math.max(0, Math.min(count - 1, next));
    this.activeIndex.set(clamped);
    document
      .getElementById(this.optionId(clamped))
      ?.scrollIntoView({ block: 'nearest' });
  }
}
