export interface AuditTrailResponseDto {
  _id: string;
  requestId: string;
  systemUserId?: string;
  systemUserName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  accessedAt: string;
  createdAt: string;
}
