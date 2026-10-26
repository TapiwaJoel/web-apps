import { ProfileType } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const PROFILE_TYPE_OPTIONS: SelectOption<ProfileType>[] = [
  { value: ProfileType.STUDENT, label: 'Student' },
  { value: ProfileType.TUTOR, label: 'Tutor' },
  { value: ProfileType.ADMIN, label: 'Admin' },
];
