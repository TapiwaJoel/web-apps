import { DocumentResourceResponseDto } from './document-resource-response.dto';
import { MediaResourceResponseDto } from './media-resource-response.dto';
import { ResourceResponseDto } from './resource-response.dto';

/**
 * A resource as returned by GET /resources and POST /resources/media:
 * the nested `resource` is either media (image/video/audio) or a document.
 */
export type AnyResourceResponseDto = ResourceResponseDto<
  MediaResourceResponseDto | DocumentResourceResponseDto
>;
