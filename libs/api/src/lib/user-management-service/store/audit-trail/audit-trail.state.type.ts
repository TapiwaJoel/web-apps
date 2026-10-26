import { AuditTrailResponseDto } from '../../dtos';

export interface AuditTrailState {
  auditTrail: AuditTrailResponseDto[];
  auditTrailLoaded: boolean;
  auditTrailLoading: boolean;
  auditTrailError: string | null;
  myAuditTrail: AuditTrailResponseDto[];
  myAuditTrailLoaded: boolean;
  myAuditTrailLoading: boolean;
  myAuditTrailError: string | null;
}
