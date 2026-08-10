/**
 * SpeakerRoleDto
 *
 * Re-exported from domain layer for DTO usage.
 */
export enum SpeakerRoleDto {
  HOST = 'host',
  CO_HOST = 'co-host',
  PANELIST = 'panelist',
}

export interface AddSpeakerDto {
  userId: string;
  role: SpeakerRoleDto;
}
