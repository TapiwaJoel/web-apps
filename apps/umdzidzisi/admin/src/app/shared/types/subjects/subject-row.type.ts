import { SubjectResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface SubjectRow extends SubjectResponseDto {
  statusTone: StatusTone;
  examinationBoardName: string;
  educationalLevelName: string;
  subjectTypeLabel: string;
  /** Direct CMS content URL for the subject image, or `null` when unset. */
  imageUrl: string | null;
}
