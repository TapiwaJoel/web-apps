/**
 * Query params accepted by GET /resources/:_id/content.
 * - thumbnail: serve the resource's thumbnail instead of the original file
 * - download: serve with Content-Disposition: attachment instead of inline
 */
export interface GetResourceContentQueryDto {
  thumbnail?: boolean;
  download?: boolean;
}
