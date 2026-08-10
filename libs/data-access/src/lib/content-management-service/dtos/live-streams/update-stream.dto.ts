import { StreamAction } from '../enums';

/**
 * UpdateStreamDto
 *
 * Supports both property updates and action-based updates.
 */
export interface UpdateStreamDto {
  title?: string;
  description?: string;
  action?: StreamAction;
}
