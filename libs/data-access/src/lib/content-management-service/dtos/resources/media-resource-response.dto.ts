import { MediaType } from '../enums';

export interface MediaResourceResponseDto {
  _id: string;
  mediaType: MediaType;
  resolution?: string;
  duration?: string;
  thumbnail?: string;
  format: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}
