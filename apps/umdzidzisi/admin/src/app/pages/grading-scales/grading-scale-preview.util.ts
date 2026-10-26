import { EntityStatus, GradingScaleResponseDto } from '@mushaviri/api';
import { GradingScaleForm } from '../../shared/types/grading-scales/grading-scale-form.type';

/** Id given to the in-progress scale when previewing it on the range bar. */
export const PREVIEW_SCALE_ID: string = '__preview__';

/**
 * The scales of the form's grading system, with the scale being created or
 * edited swapped in at its form values, for a live range-bar preview.
 */
export function previewGradingScales(
  form: GradingScaleForm,
  scales: GradingScaleResponseDto[],
  editingId?: string,
): GradingScaleResponseDto[] {
  if (!form.gradingSystemId) {
    return [];
  }
  const siblings: GradingScaleResponseDto[] = scales.filter(
    (scale: GradingScaleResponseDto): boolean =>
      scale.gradingSystemId === form.gradingSystemId && scale._id !== editingId,
  );
  if (form.minimumScore === null || form.maximumScore === null) {
    return siblings;
  }
  const candidate: GradingScaleResponseDto = {
    _id: editingId ?? PREVIEW_SCALE_ID,
    gradingSystemId: form.gradingSystemId,
    symbol: form.symbol.trim() || 'New',
    minimumScore: form.minimumScore,
    maximumScore: form.maximumScore,
    order: form.order ?? 1,
    status: EntityStatus.ACTIVE,
    createdAt: '',
    updatedAt: '',
  };
  return [...siblings, candidate];
}
