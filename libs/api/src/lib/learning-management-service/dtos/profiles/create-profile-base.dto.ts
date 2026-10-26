import { EntityStatus } from '../../../common';

/** Fields shared by every `CreateProfileDto` variant. */
export interface CreateProfileBaseDto {
  systemUser: string;
  image: string;
  educationalLevel?: string;
  grade?: string;
  bio?: string;
  status?: EntityStatus;
}
