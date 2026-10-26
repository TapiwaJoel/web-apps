/** One summary stat card rendered by `org-kpi-stat-card` (dashboard KPIs, Roles counts, etc). */
export interface KpiCard {
  label: string;
  value: string;
  icon: string;
  badge?: { text: string; tone: 'success' | 'info' };
}
