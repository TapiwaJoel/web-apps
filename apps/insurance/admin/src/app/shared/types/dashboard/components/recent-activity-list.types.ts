import { ActivityItem, ActivityStatus, PillTone } from '../dashboard.types';

export interface ActivityStatusStyle {
  tone: PillTone;
  label: string;
}

export interface ActivityRow extends ActivityItem {
  style: ActivityStatusStyle;
  avatarClass: string;
}

export const ACTIVITY_STATUS_STYLES: Record<
  ActivityStatus,
  ActivityStatusStyle
> = {
  expiring: { tone: 'warning', label: 'Policy Expiring' },
  approved: { tone: 'success', label: 'Policy Approved' },
  pending: { tone: 'info', label: 'Docs Pending' },
};
