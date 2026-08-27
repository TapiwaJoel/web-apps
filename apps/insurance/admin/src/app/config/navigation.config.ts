import { TreeNavNode } from '@mushaviri/ui';

/**
 * Navigation configuration for Insurance Admin application
 */
export const INSURANCE_ADMIN_NAV_CONFIG: TreeNavNode[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    route: '/dashboard',
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: '📄',
    iconBg: '#1e3a5f',
    iconColor: '#FFFFFF',
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
    icon: '🛡️',
    iconBg: '#00a19a',
    iconColor: '#FFFFFF',
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
    id: 'customers',
    label: 'Customers',
    icon: '👥',
    iconBg: '#9C27B0',
    iconColor: '#FFFFFF',
    route: '/customers',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    icon: '🧮',
    iconBg: '#FF9800',
    iconColor: '#FFFFFF',
    route: '/quotes',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📈',
    iconBg: '#4CAF50',
    iconColor: '#FFFFFF',
    route: '/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    iconBg: '#757575',
    iconColor: '#FFFFFF',
    route: '/settings',
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
