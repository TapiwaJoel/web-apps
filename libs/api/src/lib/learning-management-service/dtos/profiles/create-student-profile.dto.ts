import { ProfileType } from '../../enums';
import { CreateProfileBaseDto } from './create-profile-base.dto';

/** Student profiles require `educationalLevel` and `grade` (backend `@ValidateIf`). */
export interface CreateStudentProfileDto extends CreateProfileBaseDto {
  type: ProfileType.STUDENT;
  educationalLevel: string;
  grade: string;
}
