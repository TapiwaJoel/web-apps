import { CreateAdminProfileDto } from './create-admin-profile.dto';
import { CreateStudentProfileDto } from './create-student-profile.dto';
import { CreateTutorProfileDto } from './create-tutor-profile.dto';

/**
 * Body of `POST /profiles`, discriminated on `type` so the type-specific
 * required fields enforced by the backend are required here too.
 */
export type CreateProfileDto =
  CreateStudentProfileDto | CreateTutorProfileDto | CreateAdminProfileDto;
