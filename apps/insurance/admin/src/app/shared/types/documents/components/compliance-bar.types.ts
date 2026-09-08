import { ComplianceSegment, DocumentStatus } from '../documents.types';

export interface ComplianceSegmentRow extends ComplianceSegment {
  barClass: string;
}

export const SEGMENT_BAR_CLASSES: Record<DocumentStatus, string> = {
  invalid: 'bg-error',
  expiring: 'bg-warning',
  valid: 'bg-theme-accent',
};
