/**
 * StreamStatusFilter enum
 *
 * Stream statuses accepted by the `status` filter of GET /live-streams.
 */
export enum StreamStatusFilter {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
}
