import { TreeNavNode } from '@mushaviri/ui';

/**
 * Navigation configuration for Insurance Admin application
 */
export const INSURANCE_ADMIN_NAV_CONFIG: TreeNavNode[] = [
  {
    label: 'Main Menu',
    variant: 'section',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fi fi-rr-home',
    route: '/dashboard',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'fi fi-rr-document',
    route: '/documents',
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: 'fi fi-rr-shield-check',
    route: '/policies',
    children: [
      {
        id: 'all-policies',
        label: 'All Policies',
        route: '/policies/all',
      },
      {
        id: 'active-policies',
        label: 'Active',
        route: '/policies/active',
      },
      {
        id: 'lapsed-policies',
        label: 'Lapsed',
        route: '/policies/lapsed',
      },
    ],
  },
  {
    id: 'claims',
    label: 'Claims',
    icon: 'fi fi-rr-life-ring',
    route: '/claims',
    children: [
      {
        id: 'open-claims',
        label: 'Open',
        route: '/claims/open',
      },
      {
        id: 'under-review-claims',
        label: 'Under Review',
        route: '/claims/under-review',
      },
      {
        id: 'settled-claims',
        label: 'Settled',
        route: '/claims/settled',
      },
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: 'fi fi-rr-car-side',
    route: '/vehicles',
  },
  {
    id: 'client-directory',
    label: 'Client Directory',
    icon: 'fi fi-rr-address-book',
    route: '/client-directory',
  },
  {
    id: 'billing-payments',
    label: 'Billing & Payments',
    icon: 'fi fi-rr-credit-card',
    route: '/billing',
  },
  {
    label: 'Admin & Data',
    variant: 'section',
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: 'fi fi-rr-chart-line-up',
    route: '/reports',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'fi fi-rr-users',
    route: '/agents',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'fi fi-rr-settings',
    route: '/settings',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    icon: 'fi fi-rr-calculator',
    route: '/quotes',
  },
];

/**
 * User menu configuration (shown at bottom of sidebar)
 */
export const USER_MENU_CONFIG: TreeNavNode[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    route: '/profile',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: '🎨',
    route: '/preferences',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: '🚪',
    action: (): void => {
      // Logout action will be handled by component
      console.log('Logout clicked');
    },
  },
];
