export interface ExaminationFilters {
  name: string;
  examinationBoardId: string;
  educationalLevelId: string;
  status: string;
  createdFrom: string | null;
  createdTo: string | null;
}
