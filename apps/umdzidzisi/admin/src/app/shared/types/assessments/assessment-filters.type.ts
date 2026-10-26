export interface AssessmentFilters {
  examinationPaperId: string;
  subjectId: string;
  status: string;
  createdFrom: string | null;
  createdTo: string | null;
}
