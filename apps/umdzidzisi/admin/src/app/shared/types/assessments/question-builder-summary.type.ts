/** Totals of the question builder compared with the paper's targets. */
export interface QuestionBuilderSummary {
  count: number;
  totalMarks: number;
  totalMinutes: number;
  /** null when no paper is selected. */
  targetMarks: number | null;
  targetCount: number | null;
  marksMismatch: boolean;
  countMismatch: boolean;
  /** 0–100, how much of the paper's marks are allocated (capped). */
  marksPercent: number;
}
