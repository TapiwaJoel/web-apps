/**
 * StreamStatus enum
 *
 * Represents the current state of a live stream
 */
export enum StreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}
