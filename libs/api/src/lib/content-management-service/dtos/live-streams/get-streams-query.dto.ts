/**
 * StreamStatusFilter
 *
 * Possible status values for filtering streams.
 */
export enum StreamStatusFilter {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
}

/**
 * GetStreamsQueryDto
 *
 * Data transfer object for querying/filtering live streams.
 * Pagination is handled via headers (X-Page, X-Limit, X-Sort-By, X-Sort-Order).
 */
export interface GetStreamsQueryDto {
  _id?: string;
  title?: string;
  description?: string;
  status?: StreamStatusFilter;
  hostUserId?: string;
  speakerIds?: string;
  startedAfter?: string;
  startedBefore?: string;
  createdAfter?: string;
  createdBefore?: string;
  minViewers?: number;
  maxViewers?: number;
  search?: string;
}
