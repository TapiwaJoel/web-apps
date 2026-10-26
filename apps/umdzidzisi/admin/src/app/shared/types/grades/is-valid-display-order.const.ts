/** displayOrder must be a number ≥ 1. */
export const IS_VALID_DISPLAY_ORDER: (value: number | null) => boolean = (
  value: number | null,
): boolean => typeof value === 'number' && Number.isFinite(value) && value >= 1;
