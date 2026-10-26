/**
 * Editable fields of a grading scale, shared by the create dialog and the
 * detail drawer. Scores and order are `null` while their inputs are empty.
 */
export interface GradingScaleForm {
  gradingSystemId: string;
  symbol: string;
  minimumScore: number | null;
  maximumScore: number | null;
  description: string;
  order: number | null;
}
