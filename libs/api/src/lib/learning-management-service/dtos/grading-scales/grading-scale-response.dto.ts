import { EntityStatus } from '../../../common';

export interface GradingScaleResponseDto {
  _id: string;
  gradingSystemId: string;
  symbol: string;
  minimumScore: number;
  maximumScore: number;
  description?: string;
  order: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
