import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExaminationPaperForm } from '../../../shared/types/examination-papers/examination-paper-form.type';
import { EXAMINATION_PAPER_LIMITS } from '../../../shared/types/examination-papers/examination-paper-limits.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { EXAMINATION_PAPER_TYPE_OPTIONS } from '../../../shared/types/common/examination-paper-type-options.const';

/**
 * The paper's editable fields, shared by the create dialog and the detail
 * drawer. Purely presentational: it renders `form` and emits field edits.
 */
@Component({
  selector: 'org-examination-paper-fields',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-paper-fields.component.html',
})
export class ExaminationPaperFieldsComponent {
  protected readonly limits: typeof EXAMINATION_PAPER_LIMITS =
    EXAMINATION_PAPER_LIMITS;
  protected readonly typeOptions: SelectOption[] =
    EXAMINATION_PAPER_TYPE_OPTIONS;
  protected readonly statusOptions: SelectOption[] = ENTITY_STATUS_OPTIONS;

  public readonly form: InputSignal<ExaminationPaperForm> =
    input.required<ExaminationPaperForm>();
  public readonly subjectOptions: InputSignal<SelectOption[]> = input<
    SelectOption[]
  >([]);
  /** Prefix for element ids so the dialog and drawer never collide. */
  public readonly idPrefix: InputSignal<string> = input<string>('paper');

  public readonly fieldChange: OutputEmitterRef<Partial<ExaminationPaperForm>> =
    output<Partial<ExaminationPaperForm>>();

  protected update<K extends keyof ExaminationPaperForm>(
    field: K,
    value: ExaminationPaperForm[K],
  ): void {
    this.fieldChange.emit({ [field]: value } as Partial<ExaminationPaperForm>);
  }
}
