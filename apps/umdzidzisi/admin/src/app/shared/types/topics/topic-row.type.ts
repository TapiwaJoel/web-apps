import { TopicResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface TopicRow extends TopicResponseDto {
  statusTone: StatusTone;
  subjectName: string;
  gradeName: string;
  /** The grade's `displayOrder`, used by the default subject → grade → order sort. */
  gradeDisplayOrder: number;
  /** Another topic in the same (subject, grade) already uses this `order`. */
  duplicateOrder: boolean;
}
