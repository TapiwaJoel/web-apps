import { FulfilmentReportGroupBy } from '../../enums';

export interface GetFulfilmentReportQueryDto {
  from?: string; // ISO 8601 date-time; ranges on completedAt
  to?: string; // ISO 8601 date-time; ranges on completedAt
  groupBy?: FulfilmentReportGroupBy; // omit for a single overall row
}
