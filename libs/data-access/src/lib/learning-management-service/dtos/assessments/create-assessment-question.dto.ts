export interface CreateAssessmentQuestionDto {
  questionId: string;
  marks: number;
  timeAllowed: number;
  order: number;
  sectionLabel?: string;
  questionNumber?: string;
}
