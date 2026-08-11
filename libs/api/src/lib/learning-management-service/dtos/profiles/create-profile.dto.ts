import { EntityStatus } from '../../../common';
import { ProfileType } from '../../enums';

export interface CreateProfileDto {
  systemUser: string;
  type: ProfileType;
  image: string;
  educationalLevel?: string;
  grade?: string;
  bio?: string;
  status?: EntityStatus;
}
