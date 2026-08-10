import { ContentStatus } from '../enums';

export interface TopicResponseDto {
  _id: string;
  subjectId: string;
  name: string;
  order: number;
  gradeId: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
