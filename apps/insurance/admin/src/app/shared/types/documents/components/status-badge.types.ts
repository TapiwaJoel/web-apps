import { DocumentStatus } from '../documents.types';

export interface BadgeStyle {
  label: string;
  classes: string;
}

export const BADGE_STYLES: Record<DocumentStatus, BadgeStyle> = {
  valid: { label: 'Valid', classes: 'bg-success-light text-success' },
  invalid: { label: 'Invalid', classes: 'bg-error-light text-error' },
  expiring: { label: 'Expiring', classes: 'bg-warning-light text-warning' },
};
