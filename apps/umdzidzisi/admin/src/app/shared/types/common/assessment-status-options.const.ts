import { AssessmentStatus } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const ASSESSMENT_STATUS_OPTIONS: SelectOption<AssessmentStatus>[] = [
  { value: AssessmentStatus.DRAFT, label: 'Draft' },
  { value: AssessmentStatus.PUBLISHED, label: 'Published' },
  { value: AssessmentStatus.ARCHIVED, label: 'Archived' },
];
