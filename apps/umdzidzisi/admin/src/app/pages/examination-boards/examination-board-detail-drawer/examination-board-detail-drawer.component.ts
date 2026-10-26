import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CountryStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  UpdateExaminationBoardDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { COUNTRY_OPTIONS } from '../../../shared/types/common/country-options.const';
import { COUNTRY_STATUS_OPTIONS } from '../../../shared/types/common/country-status-options.const';
import { COUNTRY_STATUS_TONES } from '../../../shared/types/common/country-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ExaminationBoardForm } from '../../../shared/types/examination-boards/examination-board-form.type';
import { IS_VALID_WEBSITE } from '../../../shared/types/examination-boards/is-valid-website.const';

@Component({
  selector: 'org-examination-board-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-board-detail-drawer.component.html',
})
export class ExaminationBoardDetailDrawerComponent {
  protected readonly countryOptions: SelectOption[] = COUNTRY_OPTIONS;
  protected readonly statusOptions: SelectOption<CountryStatus>[] =
    COUNTRY_STATUS_OPTIONS;

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof ExaminationBoardsStore> = inject(
    ExaminationBoardsStore,
  );
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly examinationBoardId: InputSignal<string> =
    input.required<string>();

  protected readonly examinationBoardsLoading: Signal<boolean> =
    this.store.examinationBoardsLoading;

  protected readonly examinationBoard: Signal<
    ExaminationBoardResponseDto | undefined
  > = computed(() =>
    this.store
      .examinationBoards()
      .find(
        (board: ExaminationBoardResponseDto): boolean =>
          board._id === this.examinationBoardId(),
      ),
  );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      COUNTRY_STATUS_TONES[
        this.examinationBoard()?.status ?? CountryStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<ExaminationBoardForm | null> =
    signal(null);

  protected readonly formValue: Signal<ExaminationBoardForm> = computed(() => {
    const edited: ExaminationBoardForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const board: ExaminationBoardResponseDto | undefined =
      this.examinationBoard();
    return {
      name: board?.name ?? '',
      country: board?.country ?? '',
      description: board?.description ?? '',
      website: board?.website ?? '',
      status: board?.status ?? CountryStatus.ACTIVE,
    };
  });

  protected readonly websiteValid: Signal<boolean> = computed(() =>
    IS_VALID_WEBSITE(this.formValue().website),
  );

  protected readonly isDuplicate: Signal<boolean> = computed(() => {
    const { name, country }: ExaminationBoardForm = this.formValue();
    const normalized: string = name.trim().toLowerCase();
    if (!normalized || !country) {
      return false;
    }
    return this.store
      .examinationBoards()
      .some(
        (board: ExaminationBoardResponseDto): boolean =>
          board._id !== this.examinationBoardId() &&
          board.country === country &&
          board.name.trim().toLowerCase() === normalized,
      );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, country }: ExaminationBoardForm = this.formValue();
    return Boolean(name.trim()) && Boolean(country) && this.websiteValid();
  });

  protected readonly isDirty: Signal<boolean> = computed(
    () => this.editedForm() !== null,
  );

  public constructor() {
    this.store.loadExaminationBoards();
  }

  protected updateForm<K extends keyof ExaminationBoardForm>(
    field: K,
    value: ExaminationBoardForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveExaminationBoard(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const {
      name,
      country,
      description,
      website,
      status,
    }: ExaminationBoardForm = this.formValue();
    const dto: UpdateExaminationBoardDto = {
      name: name.trim(),
      country,
      description: description.trim(),
      // The backend's @IsUrl rejects '', so an empty website is left unchanged.
      website: website.trim() || undefined,
      status,
    };
    this.store.updateExaminationBoard(this.examinationBoardId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Examination board updated.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected close(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
