import { ProfileType } from '@mushaviri/api';
import { CreateLearnerProfileForm } from './create-learner-profile-form.type';

export const EMPTY_CREATE_LEARNER_PROFILE_FORM: CreateLearnerProfileForm = {
  systemUser: '',
  type: ProfileType.STUDENT,
  image: '',
  educationalLevel: '',
  grade: '',
  bio: '',
};
