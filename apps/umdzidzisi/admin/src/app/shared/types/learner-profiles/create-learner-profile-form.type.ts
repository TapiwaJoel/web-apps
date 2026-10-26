import { ProfileType } from '@mushaviri/api';

export interface CreateLearnerProfileForm {
  systemUser: string;
  type: ProfileType;
  image: string;
  educationalLevel: string;
  grade: string;
  bio: string;
}
