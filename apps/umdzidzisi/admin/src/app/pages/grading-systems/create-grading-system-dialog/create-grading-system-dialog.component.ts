import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateGradingSystemDto, ExaminationResponseDto } from '@mushaviri/api';
import { CreateGradingSystemForm } from '../../../shared/types/grading-systems/create-grading-system-form.type';
import { EMPTY_CREATE_GRADING_SYSTEM_FORM } from '../../../shared/types/grading-systems/empty-create-grading-system-form.const';

@Component({
  selector: 'org-create-grading-system-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-grading-system-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGradingSystemDialogComponent implements OnInit {
  public readonly examinations: InputSignal<ExaminationResponseDto[]> = input<
    ExaminationResponseDto[]
  >([]);
  /** Pre-selects an examination, e.g. when the list is filtered to one. */
  public readonly initialExaminationId: InputSignal<string> = input('');
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateGradingSystemDto> =
    output<CreateGradingSystemDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateGradingSystemForm> = signal({
    ...EMPTY_CREATE_GRADING_SYSTEM_FORM,
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const { examinationId, name }: CreateGradingSystemForm = this.form();
    return Boolean(examinationId) && Boolean(name.trim());
  });

  public ngOnInit(): void {
    const examinationId: string = this.initialExaminationId();
    if (examinationId) {
      this.updateForm('examinationId', examinationId);
    }
  }

  protected updateForm<K extends keyof CreateGradingSystemForm>(
    field: K,
    value: CreateGradingSystemForm[K],
  ): void {
    this.form.update(
      (current: CreateGradingSystemForm): CreateGradingSystemForm => ({
        ...current,
        [field]: value,
      }),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { examinationId, name, description }: CreateGradingSystemForm =
      this.form();
    this.create.emit({
      examinationId,
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
