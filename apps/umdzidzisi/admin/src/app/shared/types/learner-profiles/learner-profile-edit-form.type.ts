import { EntityStatus } from '@mushaviri/api';

export interface LearnerProfileEditForm {
  image: string;
  educationalLevel: string;
  grade: string;
  bio: string;
  status: EntityStatus;
}
