import { SubjectType } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const SUBJECT_TYPE_OPTIONS: SelectOption<SubjectType>[] = [
  { value: SubjectType.ACADEMIC, label: 'Academic' },
  { value: SubjectType.PROFESSIONAL, label: 'Professional' },
];
