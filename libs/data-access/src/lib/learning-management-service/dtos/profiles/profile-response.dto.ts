import { EntityStatus } from '../../../common';
import { ProfileType } from '../enums';

export interface ProfileResponseDto {
  _id: string;
  systemUser: string;
  type: ProfileType;
  image: string;
  educationalLevel?: string;
  grade?: string;
  bio?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
