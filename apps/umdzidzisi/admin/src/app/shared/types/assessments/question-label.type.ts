/** How a question reference is shown in the builder. */
export interface QuestionLabel {
  /** The linked article's title, or the question id when unresolved. */
  title: string;
  /** Human-readable question type, e.g. "Multiple choice". */
  type: string | null;
  resolved: boolean;
}
