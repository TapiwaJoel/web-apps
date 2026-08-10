import { Route } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard-home.component';
import { PlaceholderPageComponent } from './pages/placeholder-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
      },
      // Examinations routes
      {
        path: 'examinations',
        children: [
          {
            path: '',
            component: PlaceholderPageComponent,
            data: { title: 'Examinations Overview' },
          },
          {
            path: 'all',
            component: PlaceholderPageComponent,
            data: { title: 'All Examinations' },
          },
          {
            path: 'boards',
            component: PlaceholderPageComponent,
            data: { title: 'Examination Boards' },
          },
          {
            path: 'papers',
            component: PlaceholderPageComponent,
            data: { title: 'Examination Papers' },
          },
          {
            path: 'levels',
            component: PlaceholderPageComponent,
            data: { title: 'Educational Levels' },
          },
        ],
      },
      // Subjects routes
      {
        path: 'subjects',
        children: [
          {
            path: '',
            component: PlaceholderPageComponent,
            data: { title: 'Subjects Overview' },
          },
          {
            path: 'all',
            component: PlaceholderPageComponent,
            data: { title: 'All Subjects' },
          },
          {
            path: 'topics',
            component: PlaceholderPageComponent,
            data: { title: 'Topics' },
          },
        ],
      },
      // Subscriptions routes
      {
        path: 'subscriptions',
        children: [
          {
            path: '',
            component: PlaceholderPageComponent,
            data: { title: 'Subscriptions Overview' },
          },
          {
            path: 'active',
            component: PlaceholderPageComponent,
            data: { title: 'Active Subscriptions' },
          },
          {
            path: 'plans',
            component: PlaceholderPageComponent,
            data: { title: 'Subscription Plans' },
          },
        ],
      },
      // Profiles route
      {
        path: 'profiles',
        component: PlaceholderPageComponent,
        data: { title: 'Profiles' },
      },
      // Settings route
      {
        path: 'settings',
        component: PlaceholderPageComponent,
        data: { title: 'Settings' },
      },
      // User menu routes
      {
        path: 'preferences',
        component: PlaceholderPageComponent,
        data: { title: 'Preferences' },
      },
      // Default redirect
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
