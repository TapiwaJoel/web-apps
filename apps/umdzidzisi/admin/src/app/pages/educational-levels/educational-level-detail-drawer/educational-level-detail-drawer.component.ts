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
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  UpdateEducationalLevelDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { COUNTRY_STATUS_OPTIONS } from '../../../shared/types/common/country-status-options.const';
import { COUNTRY_STATUS_TONES } from '../../../shared/types/common/country-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { EducationalLevelForm } from '../../../shared/types/educational-levels/educational-level-form.type';

@Component({
  selector: 'org-educational-level-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './educational-level-detail-drawer.component.html',
})
export class EducationalLevelDetailDrawerComponent {
  protected readonly statusOptions: SelectOption<CountryStatus>[] =
    COUNTRY_STATUS_OPTIONS;

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof EducationalLevelsStore> = inject(
    EducationalLevelsStore,
  );
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly educationalLevelId: InputSignal<string> =
    input.required<string>();

  protected readonly educationalLevelsLoading: Signal<boolean> =
    this.store.educationalLevelsLoading;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;

  protected readonly educationalLevel: Signal<
    EducationalLevelResponseDto | undefined
  > = computed(() =>
    this.store
      .educationalLevels()
      .find(
        (level: EducationalLevelResponseDto): boolean =>
          level._id === this.educationalLevelId(),
      ),
  );

  protected readonly examinationBoardName: Signal<string> = computed(() => {
    const boardId: string = this.educationalLevel()?.examinationBoardId ?? '';
    return (
      this.examinationBoards().find(
        (board: ExaminationBoardResponseDto): boolean => board._id === boardId,
      )?.name ?? boardId
    );
  });

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      COUNTRY_STATUS_TONES[
        this.educationalLevel()?.status ?? CountryStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<EducationalLevelForm | null> =
    signal(null);

  protected readonly formValue: Signal<EducationalLevelForm> = computed(() => {
    const edited: EducationalLevelForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const level: EducationalLevelResponseDto | undefined =
      this.educationalLevel();
    return {
      examinationBoardId: level?.examinationBoardId ?? '',
      name: level?.name ?? '',
      description: level?.description ?? '',
      status: level?.status ?? CountryStatus.ACTIVE,
    };
  });

  protected readonly isDuplicate: Signal<boolean> = computed(() => {
    const { name, examinationBoardId }: EducationalLevelForm = this.formValue();
    const normalized: string = name.trim().toLowerCase();
    if (!normalized || !examinationBoardId) {
      return false;
    }
    return this.store
      .educationalLevels()
      .some(
        (level: EducationalLevelResponseDto): boolean =>
          level._id !== this.educationalLevelId() &&
          level.examinationBoardId === examinationBoardId &&
          level.name.trim().toLowerCase() === normalized,
      );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, examinationBoardId }: EducationalLevelForm = this.formValue();
    return Boolean(name.trim()) && Boolean(examinationBoardId);
  });

  protected readonly isDirty: Signal<boolean> = computed(
    () => this.editedForm() !== null,
  );

  public constructor() {
    this.store.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();
  }

  protected updateForm<K extends keyof EducationalLevelForm>(
    field: K,
    value: EducationalLevelForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveEducationalLevel(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const {
      examinationBoardId,
      name,
      description,
      status,
    }: EducationalLevelForm = this.formValue();
    const dto: UpdateEducationalLevelDto = {
      examinationBoardId,
      name: name.trim(),
      description: description.trim(),
      status,
    };
    this.store.updateEducationalLevel(this.educationalLevelId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Educational level updated.',
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
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
