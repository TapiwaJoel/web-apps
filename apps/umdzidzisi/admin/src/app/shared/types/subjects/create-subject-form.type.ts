import { SubjectType } from '@mushaviri/api';

export interface CreateSubjectForm {
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  code: string;
  subjectType: SubjectType | '';
  description: string;
  image: string;
}
