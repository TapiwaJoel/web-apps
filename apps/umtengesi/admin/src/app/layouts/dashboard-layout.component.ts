import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarLayoutComponent } from '@mushaviri/ui-common';
import { UMTENGESI_ADMIN_NAV_CONFIG, USER_MENU_CONFIG } from '../config/navigation.config';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [SidebarLayoutComponent, RouterOutlet],
  template: `
    <org-sidebar-layout
      [navigationNodes]="navConfig"
      brandName="Umtengesi Admin"
      [collapsible]="true"
    >
      <router-outlet></router-outlet>
    </org-sidebar-layout>
  `,
})
export class DashboardLayoutComponent {
  private router = inject(Router);
  navConfig = [
    ...UMTENGESI_ADMIN_NAV_CONFIG,
    ...USER_MENU_CONFIG.map(item => ({
      ...item,
      action: item.id === 'logout' ? () => this.logout() : item.action
    }))
  ];

  logout() {
    // Handle logout
    this.router.navigate(['/login']);
  }
}
