import { AssessmentStatus } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export const ASSESSMENT_STATUS_TONES: Record<AssessmentStatus, StatusTone> = {
  [AssessmentStatus.PUBLISHED]: 'success',
  [AssessmentStatus.DRAFT]: 'info',
  [AssessmentStatus.ARCHIVED]: 'warning',
};
