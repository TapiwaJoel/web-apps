import { ProfileType } from '../../enums';
import { CreateProfileBaseDto } from './create-profile-base.dto';

export interface CreateAdminProfileDto extends CreateProfileBaseDto {
  type: ProfileType.ADMIN;
}
