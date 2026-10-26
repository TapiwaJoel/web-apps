import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateExaminationBoardDto,
  ExaminationBoardResponseDto,
} from '@mushaviri/api';
import { COUNTRY_OPTIONS } from '../../../shared/types/common/country-options.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { CreateExaminationBoardForm } from '../../../shared/types/examination-boards/create-examination-board-form.type';
import { EMPTY_CREATE_EXAMINATION_BOARD_FORM } from '../../../shared/types/examination-boards/empty-create-examination-board-form.const';
import { IS_VALID_WEBSITE } from '../../../shared/types/examination-boards/is-valid-website.const';

@Component({
  selector: 'org-create-examination-board-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-examination-board-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateExaminationBoardDialogComponent {
  protected readonly countryOptions: SelectOption[] = COUNTRY_OPTIONS;

  public readonly creating: InputSignal<boolean> = input(false);
  /** Existing boards, used to flag a duplicate (name, country) pair before submit. */
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);

  public readonly create: OutputEmitterRef<CreateExaminationBoardDto> =
    output<CreateExaminationBoardDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateExaminationBoardForm> = signal({
    ...EMPTY_CREATE_EXAMINATION_BOARD_FORM,
  });

  protected readonly websiteValid: Signal<boolean> = computed(() =>
    IS_VALID_WEBSITE(this.form().website),
  );

  protected readonly isDuplicate: Signal<boolean> = computed(() => {
    const { name, country }: CreateExaminationBoardForm = this.form();
    const normalized: string = name.trim().toLowerCase();
    if (!normalized || !country) {
      return false;
    }
    return this.examinationBoards().some(
      (board: ExaminationBoardResponseDto): boolean =>
        board.country === country &&
        board.name.trim().toLowerCase() === normalized,
    );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, country }: CreateExaminationBoardForm = this.form();
    return Boolean(name.trim()) && Boolean(country) && this.websiteValid();
  });

  protected updateForm<K extends keyof CreateExaminationBoardForm>(
    field: K,
    value: CreateExaminationBoardForm[K],
  ): void {
    this.form.update(
      (current: CreateExaminationBoardForm): CreateExaminationBoardForm => ({
        ...current,
        [field]: value,
      }),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { name, country, description, website }: CreateExaminationBoardForm =
      this.form();
    this.create.emit({
      name: name.trim(),
      country,
      description: description.trim() || undefined,
      website: website.trim() || undefined,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
