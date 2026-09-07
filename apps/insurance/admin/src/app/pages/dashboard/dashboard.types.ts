/** Status tone driving a Recent Activity row's status pill. */
export type ActivityStatus = 'expiring' | 'approved' | 'pending';

/** Status tone driving a Recent Applications table row's status pill. */
export type ApplicationStatus = 'active' | 'pending' | 'expiring';

/** Semantic tone accepted by `StatusPillComponent`. */
export type PillTone = 'success' | 'warning' | 'info' | 'error';

/** One KPI summary card at the top of the dashboard. */
export interface KpiCard {
  label: string;
  value: string;
  icon: string;
  badge?: { text: string; tone: 'success' | 'info' };
}

/** One month's premium figure in the Premium Growth chart. */
export interface PremiumMonth {
  label: string;
  value: number;
}

/** One row in the Recent Activity feed. */
export interface ActivityItem {
  id: string;
  name: string;
  initials: string;
  detail: string;
  status: ActivityStatus;
}

/** One tile in the Quick Actions grid. */
export interface QuickAction {
  label: string;
  icon: string;
}

/** One row in the Recent Applications table. */
export interface ApplicationRow {
  id: string;
  clientName: string;
  initials: string;
  vehicle: string;
  policyId: string;
  premium: string;
  status: ApplicationStatus;
}

/** All mock data backing the Dashboard page. Swappable for a real service later. */
export interface DashboardPageData {
  kpis: KpiCard[];
  premiumGrowth: {
    months: PremiumMonth[];
    growthPct: number;
    activeMonthIndex: number;
  };
  activity: ActivityItem[];
  quickActions: QuickAction[];
  promo: { title: string; description: string; ctaLabel: string };
  applications: ApplicationRow[];
}

export const MOCK_DASHBOARD_DATA: DashboardPageData = {
  kpis: [
    { label: 'Active Clients', value: '3,596', icon: '👥' },
    {
      label: 'Active Policies',
      value: '12,548',
      icon: '🛡️',
      badge: { text: '+12% Last month', tone: 'success' },
    },
    { label: 'Total Premium', value: '$4.38M', icon: '💲' },
    { label: 'Renewal Rate', value: '94.2%', icon: '📈' },
    { label: 'Open Claims', value: '24', icon: '⚠️' },
  ],
  premiumGrowth: {
    months: [
      { label: 'Jan', value: 42000 },
      { label: 'Feb', value: 68000 },
      { label: 'Mar', value: 55000 },
      { label: 'Apr', value: 87000 },
      { label: 'May', value: 74000 },
      { label: 'Jun', value: 61000 },
    ],
    growthPct: 18.5,
    activeMonthIndex: 3,
  },
  activity: [
    {
      id: 'act-1',
      name: 'James Wilson',
      initials: 'JW',
      detail: '2018 Audi Q5 · Expires in 2 days',
      status: 'expiring',
    },
    {
      id: 'act-2',
      name: 'Sarah Jenkins',
      initials: 'SJ',
      detail: '2023 Tesla Model Y · 10 minutes ago',
      status: 'approved',
    },
    {
      id: 'act-3',
      name: 'Elena Rodriguez',
      initials: 'ER',
      detail: '2024 Toyota Camry · 25 minutes ago',
      status: 'pending',
    },
  ],
  quickActions: [
    { label: 'New Quote', icon: '➕' },
    { label: 'New Policy', icon: '📄' },
    { label: 'Send Claim', icon: '📤' },
    { label: 'Calculator', icon: '🧮' },
  ],
  promo: {
    title: 'Boost your premiums: Bundle & Save Campaign is live!',
    description:
      '150 of your current Auto clients are eligible for the new Home Insurance bundle discount (up to 15%).',
    ctaLabel: 'View Eligible Clients',
  },
  applications: [
    {
      id: 'app-1',
      clientName: 'Sarah Jenkins',
      initials: 'SJ',
      vehicle: '2023 Tesla Model Y',
      policyId: '#POL-9921',
      premium: '$185/mo',
      status: 'active',
    },
    {
      id: 'app-2',
      clientName: 'James Wilson',
      initials: 'JW',
      vehicle: '2018 Audi Q5',
      policyId: '#POL-9918',
      premium: '$142/mo',
      status: 'expiring',
    },
    {
      id: 'app-3',
      clientName: 'Elena Rodriguez',
      initials: 'ER',
      vehicle: '2024 Toyota Camry',
      policyId: '#POL-9925',
      premium: '$168/mo',
      status: 'pending',
    },
    {
      id: 'app-4',
      clientName: 'Michael Chen',
      initials: 'MC',
      vehicle: '2021 Honda CR-V',
      policyId: '#POL-9902',
      premium: '$129/mo',
      status: 'active',
    },
  ],
};
