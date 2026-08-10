import { EntityStatus } from '../../../common';

export interface UpdateProfileDto {
  image?: string;
  educationalLevel?: string;
  grade?: string;
  bio?: string;
  status?: EntityStatus;
}
