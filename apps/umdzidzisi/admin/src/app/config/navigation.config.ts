import { TreeNavNode } from '@mushaviri/ui-common';

/**
 * Icon-rail configuration (the thin left column of circular buttons).
 * One icon per top-level menu item, in the same order as the tree.
 */
export const UMDZIDZISI_RAIL_CONFIG: TreeNavNode[] = [
  {
    id: 'rail-dashboard',
    label: 'Dashboard',
    icon: 'fi fi-rr-home',
    route: 'dashboard',
    active: true,
  },
  {
    id: 'rail-examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    route: 'examinations/all',
  },
  {
    id: 'rail-subjects',
    label: 'Subjects',
    icon: 'fi fi-rr-book-open-reader',
    route: 'subjects/all',
  },
  {
    id: 'rail-subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    route: 'subscriptions/active',
  },
  {
    id: 'rail-profiles',
    label: 'Profiles',
    icon: 'fi fi-rr-user',
    route: 'profiles',
  },
  {
    id: 'rail-settings',
    label: 'Settings',
    icon: 'fi fi-rr-settings',
    route: 'settings',
  },
  {
    id: 'rail-preferences',
    label: 'Preferences',
    icon: 'fi fi-rr-settings-sliders',
    route: 'preferences',
  },
];

/**
 * Rail items pinned to the bottom of the rail (logout).
 * The logout action is wired in the layout component.
 */
export const UMDZIDZISI_RAIL_FOOTER_CONFIG: TreeNavNode[] = [
  {
    id: 'rail-logout',
    label: 'Logout',
    icon: 'fi fi-rr-sign-out-alt',
  },
];

/**
 * Navigation configuration for Umdzidzisi Admin application
 */
export const UMDZIDZISI_ADMIN_NAV_CONFIG: TreeNavNode[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fi fi-rr-home',
    route: 'dashboard',
  },
  {
    id: 'examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    variant: 'section',
    expanded: true,
    badge: '38',
    children: [
      {
        id: 'all-examinations',
        label: 'All Examinations',
        route: 'examinations/all',
      },
      {
        id: 'examination-boards',
        label: 'Examination Boards',
        route: 'examinations/boards',
      },
      {
        id: 'examination-papers',
        label: 'Examination Papers',
        route: 'examinations/papers',
      },
      {
        id: 'educational-levels',
        label: 'Educational Levels',
        route: 'examinations/levels',
      },
    ],
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: 'fi fi-rr-book-open-reader',
    variant: 'section',
    children: [
      {
        id: 'all-subjects',
        label: 'All Subjects',
        route: 'subjects/all',
      },
      {
        id: 'topics',
        label: 'Topics',
        route: 'subjects/topics',
      },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    variant: 'section',
    badge: '5',
    children: [
      {
        id: 'active-subscriptions',
        label: 'Active Subscriptions',
        route: 'subscriptions/active',
      },
      {
        id: 'subscription-plans',
        label: 'Subscription Plans',
        route: 'subscriptions/plans',
      },
    ],
  },
  {
    id: 'profiles',
    label: 'Profiles',
    icon: 'fi fi-rr-user',
    route: 'profiles',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'fi fi-rr-settings',
    route: 'settings',
  },
];

/**
 * User menu configuration (shown at bottom of sidebar)
 */
export const USER_MENU_CONFIG: TreeNavNode[] = [
  {
    id: 'preferences',
    label: 'Preferences',
    icon: '🎨',
    route: 'preferences',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: '🚪',
    action: (): void => {
      // Logout handled by the layout component wiring.
    },
  },
];
