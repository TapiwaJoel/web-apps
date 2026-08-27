import { EntityStatus } from '../../../common';
import { PolicyComponent } from '../../enums';

export interface GetPartnerKiosksQueryDto {
  _id?: string;
  partnerId?: string;
  capability?: PolicyComponent;
  status?: EntityStatus;
}
