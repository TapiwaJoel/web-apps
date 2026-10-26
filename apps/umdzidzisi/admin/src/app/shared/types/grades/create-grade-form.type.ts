export interface CreateGradeForm {
  /** UI-only: narrows the level select; not sent to the API. */
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  displayOrder: number | null;
}
