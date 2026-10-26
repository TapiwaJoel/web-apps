/** `true` for whole numbers ≥ 1 (topic/sub-topic `order`, durations). */
export const isPositiveInteger: (value: number | null) => boolean = (
  value: number | null,
): boolean => value !== null && Number.isInteger(value) && value >= 1;
