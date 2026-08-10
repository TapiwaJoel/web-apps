import { FileType } from '../enums';
import { MediaResourceResponseDto } from './media-resource-response.dto';
import { DocumentResourceResponseDto } from './document-resource-response.dto';

export interface ResourceResponseDto<T extends MediaResourceResponseDto | DocumentResourceResponseDto> {
  _id: string;
  name: string;
  type: FileType;
  date: string;
  numberOfTimeAccessed: number;
  thumbnailId?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingProgress?: number;
  processingError?: string;
  resource?: T;
  createdAt: string;
  updatedAt: string;
}
