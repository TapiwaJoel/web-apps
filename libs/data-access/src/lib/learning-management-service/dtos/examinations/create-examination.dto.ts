export interface CreateExaminationDto {
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  qualification?: string;
  description?: string;
}
