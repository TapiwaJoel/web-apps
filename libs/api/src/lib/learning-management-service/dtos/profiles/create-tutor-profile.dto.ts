import { ProfileType } from '../../enums';
import { CreateProfileBaseDto } from './create-profile-base.dto';

/** Tutor profiles require `bio` (backend `@ValidateIf`). */
export interface CreateTutorProfileDto extends CreateProfileBaseDto {
  type: ProfileType.TUTOR;
  bio: string;
}
