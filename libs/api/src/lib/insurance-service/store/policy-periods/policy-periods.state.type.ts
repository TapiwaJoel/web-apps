import { PolicyPeriodResponseDto } from '../../dtos';

export interface PolicyPeriodsState {
  policyPeriods: PolicyPeriodResponseDto[];
  policyPeriodsLoaded: boolean;
  policyPeriodsLoading: boolean;
  policyPeriodsError: string | null;
}
