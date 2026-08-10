export interface UpdateGradingScaleDto {
  gradingSystemId?: string;
  symbol?: string;
  minimumScore?: number;
  maximumScore?: number;
  description?: string;
  order?: number;
}
