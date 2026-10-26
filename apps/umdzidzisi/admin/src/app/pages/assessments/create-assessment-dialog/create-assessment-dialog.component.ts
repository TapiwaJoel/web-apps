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
import { CreateAssessmentDto } from '@mushaviri/api';
import { AssessmentFieldsComponent } from '../assessment-fields/assessment-fields.component';
import { AssessmentForm } from '../../../shared/types/assessments/assessment-form.type';
import { AssessmentLookups } from '../../../shared/types/assessments/assessment-lookups.type';
import { AssessmentSelectOptions } from '../../../shared/types/assessments/assessment-select-options.type';
import { EMPTY_ASSESSMENT_FORM } from '../../../shared/types/assessments/empty-assessment-form.const';
import { applyAssessmentFormPatch } from '../../../shared/types/assessments/apply-assessment-form-patch.const';
import { assessmentFormToDto } from '../../../shared/types/assessments/assessment-form-to-dto.const';
import { buildAssessmentSelectOptions } from '../../../shared/types/assessments/build-assessment-select-options.const';
import { isAssessmentFormValid } from '../../../shared/types/assessments/is-assessment-form-valid.const';
import { resolvePaperLevelName } from '../../../shared/types/assessments/resolve-paper-level-name.const';

/** Creates an assessment without questions; they're added in the drawer. */
@Component({
  selector: 'org-create-assessment-dialog',
  standalone: true,
  imports: [AssessmentFieldsComponent],
  templateUrl: './create-assessment-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssessmentDialogComponent implements OnInit {
  protected readonly form: WritableSignal<AssessmentForm> = signal({
    ...EMPTY_ASSESSMENT_FORM,
  });

  public readonly lookups: InputSignal<AssessmentLookups> =
    input.required<AssessmentLookups>();
  /** Pre-selects the paper when the list is filtered to one. */
  public readonly initialPaperId: InputSignal<string> = input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateAssessmentDto> =
    output<CreateAssessmentDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly options: Signal<AssessmentSelectOptions> =
    computed<AssessmentSelectOptions>(() =>
      buildAssessmentSelectOptions(this.lookups(), this.form()),
    );

  protected readonly isValid: Signal<boolean> = computed<boolean>(() =>
    isAssessmentFormValid(this.form()),
  );

  public ngOnInit(): void {
    const paperId: string = this.initialPaperId();
    if (paperId) {
      this.updateForm({ examinationPaperId: paperId });
    }
  }

  protected updateForm(patch: Partial<AssessmentForm>): void {
    this.form.update((current: AssessmentForm): AssessmentForm =>
      applyAssessmentFormPatch(current, patch, (paperId: string): string =>
        resolvePaperLevelName(this.lookups(), paperId),
      ),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    this.create.emit({ ...assessmentFormToDto(this.form()), questions: [] });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
