import { TreeNavNode } from '@mushaviri/ui';

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
    id: 'rail-curriculum',
    label: 'Curriculum',
    icon: 'fi fi-rr-book-open-reader',
    // Section root so the rail icon stays active for every curriculum/* child.
    route: 'curriculum',
    children: [
      {
        id: 'examination-boards',
        label: 'Examination Boards',
        route: 'curriculum/boards',
      },
      {
        id: 'educational-levels',
        label: 'Educational Levels',
        route: 'curriculum/levels',
      },
      { id: 'grades', label: 'Grades', route: 'curriculum/grades' },
      { id: 'subjects', label: 'Subjects', route: 'curriculum/subjects' },
      { id: 'topics', label: 'Topics', route: 'curriculum/topics' },
      { id: 'sub-topics', label: 'Sub-topics', route: 'curriculum/sub-topics' },
    ],
  },
  {
    id: 'rail-examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    // Section root so the rail icon stays active for every examinations/* child.
    route: 'examinations',
    children: [
      {
        id: 'all-examinations',
        label: 'Examinations',
        route: 'examinations/all',
      },
      {
        id: 'examination-papers',
        label: 'Examination Papers',
        route: 'examinations/papers',
      },
      {
        id: 'assessments',
        label: 'Assessments',
        route: 'examinations/assessments',
      },
      {
        id: 'grading-systems',
        label: 'Grading Systems',
        route: 'examinations/grading-systems',
      },
      {
        id: 'grading-scales',
        label: 'Grading Scales',
        route: 'examinations/grading-scales',
      },
    ],
  },
  {
    id: 'rail-subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    // Section root so the rail icon stays active for every subscriptions/* child.
    route: 'subscriptions',
    children: [
      {
        id: 'subscription-plans',
        label: 'Subscription Plans',
        route: 'subscriptions/plans',
      },
      {
        id: 'all-subscriptions',
        label: 'Subscriptions',
        route: 'subscriptions/all',
      },
    ],
  },
  {
    id: 'rail-learners',
    label: 'Learners',
    icon: 'fi fi-rr-users',
    // Section root so the rail icon stays active for every learners/* child.
    route: 'learners',
    children: [
      {
        id: 'learner-profiles',
        label: 'Learner Profiles',
        route: 'learners/profiles',
      },
    ],
  },
  {
    id: 'rail-admin',
    label: 'Admin',
    icon: 'fi fi-rr-user-gear',
    children: [
      { id: 'users', label: 'Users', route: 'users' },
      { id: 'roles', label: 'Roles', route: 'roles' },
    ],
  },
  {
    id: 'rail-profile',
    label: 'Profile',
    icon: 'fi fi-rr-user',
    route: 'profile',
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
    id: 'curriculum',
    label: 'Curriculum',
    icon: 'fi fi-rr-book-open-reader',
    variant: 'section',
    expanded: true,
    children: [
      {
        id: 'examination-boards',
        label: 'Examination Boards',
        route: 'curriculum/boards',
      },
      {
        id: 'educational-levels',
        label: 'Educational Levels',
        route: 'curriculum/levels',
      },
      { id: 'grades', label: 'Grades', route: 'curriculum/grades' },
      { id: 'subjects', label: 'Subjects', route: 'curriculum/subjects' },
      { id: 'topics', label: 'Topics', route: 'curriculum/topics' },
      { id: 'sub-topics', label: 'Sub-topics', route: 'curriculum/sub-topics' },
    ],
  },
  {
    id: 'examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    variant: 'section',
    children: [
      {
        id: 'all-examinations',
        label: 'Examinations',
        route: 'examinations/all',
      },
      {
        id: 'examination-papers',
        label: 'Examination Papers',
        route: 'examinations/papers',
      },
      {
        id: 'assessments',
        label: 'Assessments',
        route: 'examinations/assessments',
      },
      {
        id: 'grading-systems',
        label: 'Grading Systems',
        route: 'examinations/grading-systems',
      },
      {
        id: 'grading-scales',
        label: 'Grading Scales',
        route: 'examinations/grading-scales',
      },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    variant: 'section',
    children: [
      {
        id: 'subscription-plans',
        label: 'Subscription Plans',
        route: 'subscriptions/plans',
      },
      {
        id: 'all-subscriptions',
        label: 'Subscriptions',
        route: 'subscriptions/all',
      },
    ],
  },
  {
    id: 'learners',
    label: 'Learners',
    icon: 'fi fi-rr-users',
    variant: 'section',
    children: [
      {
        id: 'learner-profiles',
        label: 'Learner Profiles',
        route: 'learners/profiles',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'fi fi-rr-user-gear',
    variant: 'section',
    children: [
      {
        id: 'users',
        label: 'Users',
        icon: 'fi fi-rr-user-gear',
        route: 'users',
      },
      { id: 'roles', label: 'Roles', icon: 'fi fi-rr-lock', route: 'roles' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'fi fi-rr-user',
    route: 'profile',
  },
];
