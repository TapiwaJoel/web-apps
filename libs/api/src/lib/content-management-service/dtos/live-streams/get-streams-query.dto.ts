import { StreamStatusFilter } from '../../enums';

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
