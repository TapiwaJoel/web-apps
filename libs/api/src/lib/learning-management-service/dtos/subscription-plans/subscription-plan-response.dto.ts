import { Currency, EntityStatus } from '../../../common';
import { BillingCycle } from '../../enums';

export interface SubscriptionPlanResponseDto {
  _id: string;
  educationalLevelId: string;
  name: string;
  description?: string;
  numberOfSubjects: number;
  price: number;
  currency: Currency;
  billingCycle: BillingCycle;
  gracePeriodDays: number;
  status: EntityStatus;
  examinationBoardId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
