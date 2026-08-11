import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarLayoutComponent, TreeNavNode } from '@mushaviri/ui';
import {
  UMTENGESI_ADMIN_NAV_CONFIG,
  USER_MENU_CONFIG,
} from '../config/navigation.config';

@Component({
  selector: 'org-dashboard-layout',
  standalone: true,
  imports: [SidebarLayoutComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly router: Router = inject(Router);
  public navConfig: TreeNavNode[] = [
    ...UMTENGESI_ADMIN_NAV_CONFIG,
    ...USER_MENU_CONFIG.map((item) => ({
      ...item,
      action: item.id === 'logout' ? () => this.logout() : item.action,
    })),
  ];

  public logout(): void {
    // Handle logout
    this.router.navigate(['/login']);
  }
}
