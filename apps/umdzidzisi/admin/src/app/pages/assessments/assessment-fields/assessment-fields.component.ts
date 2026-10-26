import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TopicTagsInputComponent } from '../topic-tags-input/topic-tags-input.component';
import { AssessmentForm } from '../../../shared/types/assessments/assessment-form.type';
import { AssessmentSelectOptions } from '../../../shared/types/assessments/assessment-select-options.type';
import { ASSESSMENT_LIMITS } from '../../../shared/types/assessments/assessment-limits.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ASSESSMENT_STATUS_OPTIONS } from '../../../shared/types/common/assessment-status-options.const';

/**
 * The assessment's editable fields (everything but the questions), shared by
 * the create dialog and the detail drawer. Cascades are applied by the parent.
 */
@Component({
  selector: 'org-assessment-fields',
  standalone: true,
  imports: [FormsModule, TopicTagsInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assessment-fields.component.html',
})
export class AssessmentFieldsComponent {
  protected readonly limits: typeof ASSESSMENT_LIMITS = ASSESSMENT_LIMITS;
  protected readonly statusOptions: SelectOption[] = ASSESSMENT_STATUS_OPTIONS;

  public readonly form: InputSignal<AssessmentForm> =
    input.required<AssessmentForm>();
  public readonly options: InputSignal<AssessmentSelectOptions> =
    input.required<AssessmentSelectOptions>();
  /** Prefix for element ids so the dialog and drawer never collide. */
  public readonly idPrefix: InputSignal<string> = input<string>('assessment');

  public readonly fieldChange: OutputEmitterRef<Partial<AssessmentForm>> =
    output<Partial<AssessmentForm>>();

  protected update<K extends keyof AssessmentForm>(
    field: K,
    value: AssessmentForm[K],
  ): void {
    this.fieldChange.emit({ [field]: value } as Partial<AssessmentForm>);
  }
}
