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
import {
  CreateGradingScaleDto,
  GradingScaleResponseDto,
  GradingSystemResponseDto,
} from '@mushaviri/api';
import { GradingScaleForm } from '../../../shared/types/grading-scales/grading-scale-form.type';
import { EMPTY_GRADING_SCALE_FORM } from '../../../shared/types/grading-scales/empty-grading-scale-form.const';
import { GradingScaleRangeBarComponent } from '../grading-scale-range-bar/grading-scale-range-bar.component';
import { validateGradingScale } from '../validate-grading-scale.util';
import { previewGradingScales } from '../grading-scale-preview.util';

@Component({
  selector: 'org-create-grading-scale-dialog',
  standalone: true,
  imports: [FormsModule, GradingScaleRangeBarComponent],
  templateUrl: './create-grading-scale-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGradingScaleDialogComponent implements OnInit {
  public readonly gradingSystems: InputSignal<GradingSystemResponseDto[]> =
    input<GradingSystemResponseDto[]>([]);
  /** Every known scale, used for overlap/uniqueness checks and the preview. */
  public readonly gradingScales: InputSignal<GradingScaleResponseDto[]> = input<
    GradingScaleResponseDto[]
  >([]);
  /** Pre-selects a grading system, e.g. when the list is filtered to one. */
  public readonly initialGradingSystemId: InputSignal<string> = input('');
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateGradingScaleDto> =
    output<CreateGradingScaleDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<GradingScaleForm> = signal({
    ...EMPTY_GRADING_SCALE_FORM,
  });
  private readonly submitAttempted: WritableSignal<boolean> = signal(false);

  protected readonly formError: Signal<string | null> = computed<string | null>(
    () => validateGradingScale(this.form(), this.gradingScales()),
  );

  protected readonly showError: Signal<boolean> = computed<boolean>(() => {
    const { minimumScore, maximumScore }: GradingScaleForm = this.form();
    return (
      this.submitAttempted() || (minimumScore !== null && maximumScore !== null)
    );
  });

  protected readonly previewScales: Signal<GradingScaleResponseDto[]> =
    computed<GradingScaleResponseDto[]>(() =>
      previewGradingScales(this.form(), this.gradingScales()),
    );

  public ngOnInit(): void {
    const gradingSystemId: string = this.initialGradingSystemId();
    if (gradingSystemId) {
      this.updateForm('gradingSystemId', gradingSystemId);
    }
  }

  protected updateForm<K extends keyof GradingScaleForm>(
    field: K,
    value: GradingScaleForm[K],
  ): void {
    this.form.update((current: GradingScaleForm): GradingScaleForm => ({
      ...current,
      [field]: value,
      ...(field === 'gradingSystemId'
        ? { order: this.nextOrder(value as string) }
        : {}),
    }));
  }

  protected onSubmit(): void {
    this.submitAttempted.set(true);
    if (this.formError() || this.creating()) {
      return;
    }
    const {
      gradingSystemId,
      symbol,
      minimumScore,
      maximumScore,
      description,
      order,
    }: GradingScaleForm = this.form();
    this.create.emit({
      gradingSystemId,
      symbol: symbol.trim(),
      minimumScore: minimumScore ?? 0,
      maximumScore: maximumScore ?? 0,
      description: description.trim() || undefined,
      order: order ?? 1,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }

  /** Suggests the next order after the system's existing scales. */
  private nextOrder(gradingSystemId: string): number {
    return (
      this.gradingScales().filter(
        (scale: GradingScaleResponseDto): boolean =>
          scale.gradingSystemId === gradingSystemId,
      ).length + 1
    );
  }
}
