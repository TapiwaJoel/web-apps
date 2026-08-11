import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSelectorComponent } from '../components/app-selector/app-selector.component';
import { SidebarLayoutComponent, TreeNavNode } from '@mushaviri/ui';

@Component({
  selector: 'org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppSelectorComponent,
    SidebarLayoutComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  /**
   * Navigation menu structure
   */
  public navigationNodes: TreeNavNode[] = [
    {
      id: 'starred',
      label: 'Starred',
      icon: 'fi fi-rr-star',
      route: '/dashboard/starred',
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: 'fi fi-rr-clock',
      route: '/dashboard/recent',
    },
    {
      id: 'sales',
      label: 'Sales list',
      icon: 'fi fi-rr-chart-histogram',
      expanded: false,
      children: [
        {
          id: 'goals',
          label: 'Goals',
          route: '/dashboard/sales/goals',
        },
        {
          id: 'dashboard-sales',
          label: 'Dashboard',
          route: '/dashboard/sales/dashboard',
          badge: 3,
          action: () => console.log('Add new dashboard'),
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'fi fi-rr-folder',
      expanded: true,
      action: () => console.log('Add new project'),
      children: [
        {
          id: 'codename',
          label: 'Codename',
          children: [
            {
              id: 'cargo2go',
              label: 'Cargo2go',
              route: '/dashboard/projects/cargo2go',
            },
            {
              id: 'loadsB',
              label: 'LoadsB',
              route: '/dashboard/projects/loadsb',
              badge: 7,
            },
            {
              id: 'idioma',
              label: 'Idioma',
              route: '/dashboard/projects/idioma',
            },
            {
              id: 'syllables',
              label: 'Syllables',
              route: '/dashboard/projects/syllables',
            },
            {
              id: 'x-0b',
              label: 'x-0b',
              route: '/dashboard/projects/x-0b',
            },
          ],
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'fi fi-rr-chart-line-up',
      expanded: false,
      action: () => console.log('Add new report'),
      children: [
        {
          id: 'share-with-me',
          label: 'Share with me',
          children: [
            {
              id: 'deals-by-user',
              label: 'Deals by user',
              route: '/dashboard/reports/deals-by-user',
            },
            {
              id: 'deal-duration',
              label: 'Deal duration',
              route: '/dashboard/reports/deal-duration',
            },
          ],
        },
        {
          id: 'my-reports',
          label: 'My reports',
          children: [
            {
              id: 'emails-received',
              label: 'Emails received',
              route: '/dashboard/reports/emails-received',
            },
            {
              id: 'deal-duration-2',
              label: 'Deal duration',
              route: '/dashboard/reports/deal-duration-2',
            },
            {
              id: 'new-report',
              label: 'New report',
              route: '/dashboard/reports/new',
              cssClass: 'text-error',
            },
            {
              id: 'analytics',
              label: 'Analytics',
              route: '/dashboard/reports/analytics',
              badge: 7,
            },
          ],
        },
      ],
    },
  ];
}
