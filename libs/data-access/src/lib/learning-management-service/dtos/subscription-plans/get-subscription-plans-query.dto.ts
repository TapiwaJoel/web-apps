import { Currency, EntityStatus, PaginationParams } from '../../../common';
import { BillingCycle } from '../enums';

export interface GetSubscriptionPlansQueryDto extends PaginationParams {
  _id?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  status?: EntityStatus;
  currency?: Currency;
  billingCycle?: BillingCycle;
  name?: string;
  numberOfSubjects?: number;
}
