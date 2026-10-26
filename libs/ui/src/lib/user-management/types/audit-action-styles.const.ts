import { AuditActionStyle } from './audit-action-style.type';

export const AUDIT_ACTION_STYLES: Record<string, AuditActionStyle> = {
  create: { icon: 'fi fi-rr-plus', tone: 'success', label: 'Created' },
  update: { icon: 'fi fi-rr-edit', tone: 'info', label: 'Updated' },
  delete: { icon: 'fi fi-rr-trash', tone: 'error', label: 'Deleted' },
  logout: {
    icon: 'fi fi-rr-sign-out-alt',
    tone: 'warning',
    label: 'Logged out',
  },
};

export const DEFAULT_AUDIT_ACTION_STYLE: AuditActionStyle = {
  icon: 'fi fi-rr-info',
  tone: 'info',
  label: 'Activity',
};
