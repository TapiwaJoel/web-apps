import { ContentStatus, SubjectType } from '../enums';

export interface SubjectResponseDto {
  _id: string;
  name: string;
  code: string;
  image?: string;
  description?: string;
  educationalLevelId: string;
  examinationBoardId: string;
  subjectType: SubjectType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
