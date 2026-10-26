import { GradingScaleResponseDto } from '@mushaviri/api';
import { GradingScaleForm } from '../../shared/types/grading-scales/grading-scale-form.type';

/**
 * Client-side checks for a grading scale, mirroring (and going beyond) the
 * backend: required fields, 0–100 scores, min ≤ max (the server does not
 * check this), order ≥ 1, an inclusive range that doesn't overlap another
 * scale in the same system, and a symbol unique within that system.
 *
 * Like the backend's overlap query, every scale in the system counts,
 * whatever its status. `excludeId` skips the scale being edited.
 *
 * @returns the first problem as a user-facing message, or `null` when valid.
 */
export function validateGradingScale(
  form: GradingScaleForm,
  scales: GradingScaleResponseDto[],
  excludeId?: string,
): string | null {
  const {
    gradingSystemId,
    symbol,
    minimumScore,
    maximumScore,
    order,
  }: GradingScaleForm = form;

  if (!gradingSystemId || !symbol.trim()) {
    return 'Choose a grading system and enter a symbol.';
  }
  if (!isNumber(minimumScore) || !isNumber(maximumScore)) {
    return 'Enter both a minimum and a maximum score.';
  }
  if (
    minimumScore < 0 ||
    minimumScore > 100 ||
    maximumScore < 0 ||
    maximumScore > 100
  ) {
    return 'Scores must be between 0 and 100.';
  }
  if (minimumScore > maximumScore) {
    return 'Minimum score can’t be higher than the maximum score.';
  }
  if (!isNumber(order) || order < 1) {
    return 'Order must be 1 or higher.';
  }

  const siblings: GradingScaleResponseDto[] = scales.filter(
    (scale: GradingScaleResponseDto): boolean =>
      scale.gradingSystemId === gradingSystemId && scale._id !== excludeId,
  );

  const trimmedSymbol: string = symbol.trim();
  const duplicate: GradingScaleResponseDto | undefined = siblings.find(
    (scale: GradingScaleResponseDto): boolean => scale.symbol === trimmedSymbol,
  );
  if (duplicate) {
    return `Symbol “${trimmedSymbol}” is already used in this grading system.`;
  }

  const overlapping: GradingScaleResponseDto | undefined = siblings.find(
    (scale: GradingScaleResponseDto): boolean =>
      minimumScore <= scale.maximumScore && scale.minimumScore <= maximumScore,
  );
  if (overlapping) {
    return `${minimumScore}–${maximumScore} overlaps “${overlapping.symbol}” (${overlapping.minimumScore}–${overlapping.maximumScore}).`;
  }

  return null;
}

function isNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
