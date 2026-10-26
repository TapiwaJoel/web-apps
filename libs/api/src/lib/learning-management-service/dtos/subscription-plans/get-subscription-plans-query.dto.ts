import { Currency, EntityStatus } from '../../../common';
import { BillingCycle } from '../../enums';

export interface GetSubscriptionPlansQueryDto {
  _id?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  status?: EntityStatus;
  currency?: Currency;
  billingCycle?: BillingCycle;
  name?: string;
  numberOfSubjects?: number;
}
