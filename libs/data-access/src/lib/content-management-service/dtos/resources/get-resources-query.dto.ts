import { FileType } from '../../enums';

export interface GetResourcesQueryDto {
  _id?: string;
  name?: string;
  type?: FileType;
}
