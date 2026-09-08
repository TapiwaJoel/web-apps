import {
  ApplicationRow,
  ApplicationStatus,
  PillTone,
} from '../dashboard.types';

export interface ApplicationStatusStyle {
  tone: PillTone;
  label: string;
}

export interface ApplicationDisplayRow extends ApplicationRow {
  style: ApplicationStatusStyle;
}

export const APPLICATION_STATUS_STYLES: Record<
  ApplicationStatus,
  ApplicationStatusStyle
> = {
  active: { tone: 'success', label: 'Active' },
  pending: { tone: 'warning', label: 'Pending' },
  expiring: { tone: 'warning', label: 'Expiring' },
};
