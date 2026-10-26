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
import {
  CreateExaminationPaperDto,
  ExaminationPaperType,
} from '@mushaviri/api';
import { ExaminationPaperFieldsComponent } from '../examination-paper-fields/examination-paper-fields.component';
import { ExaminationPaperForm } from '../../../shared/types/examination-papers/examination-paper-form.type';
import { EMPTY_EXAMINATION_PAPER_FORM } from '../../../shared/types/examination-papers/empty-examination-paper-form.const';
import { isExaminationPaperFormValid } from '../../../shared/types/examination-papers/is-examination-paper-form-valid.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-create-examination-paper-dialog',
  standalone: true,
  imports: [ExaminationPaperFieldsComponent],
  templateUrl: './create-examination-paper-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateExaminationPaperDialogComponent implements OnInit {
  protected readonly form: WritableSignal<ExaminationPaperForm> = signal({
    ...EMPTY_EXAMINATION_PAPER_FORM,
  });

  public readonly subjectOptions: InputSignal<SelectOption[]> = input<
    SelectOption[]
  >([]);
  /** Pre-selects the subject when the list is filtered to one. */
  public readonly initialSubjectId: InputSignal<string> = input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateExaminationPaperDto> =
    output<CreateExaminationPaperDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly isValid: Signal<boolean> = computed<boolean>(() =>
    isExaminationPaperFormValid(this.form()),
  );

  public ngOnInit(): void {
    const subjectId: string = this.initialSubjectId();
    if (subjectId) {
      this.form.update(
        (current: ExaminationPaperForm): ExaminationPaperForm => ({
          ...current,
          subjectId,
        }),
      );
    }
  }

  protected updateForm(patch: Partial<ExaminationPaperForm>): void {
    this.form.update((current: ExaminationPaperForm): ExaminationPaperForm => ({
      ...current,
      ...patch,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const form: ExaminationPaperForm = this.form();
    this.create.emit({
      subjectId: form.subjectId,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type as ExaminationPaperType,
      numberOfQuestions: Number(form.numberOfQuestions),
      duration: Number(form.duration),
      marks: Number(form.marks),
      status: form.status,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
