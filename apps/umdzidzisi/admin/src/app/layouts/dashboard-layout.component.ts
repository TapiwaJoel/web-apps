import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  SidebarLayoutComponent,
  TreeNavConfig,
  TreeNavNode,
} from '@mushaviri/ui-common';
import {
  UMDZIDZISI_ADMIN_NAV_CONFIG,
  UMDZIDZISI_RAIL_CONFIG,
  UMDZIDZISI_RAIL_FOOTER_CONFIG,
  USER_MENU_CONFIG,
} from '../config/navigation.config';

@Component({
  selector: 'org-dashboard-layout',
  standalone: true,
  imports: [SidebarLayoutComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  private readonly router: Router = inject(Router);
  protected readonly railConfig: TreeNavNode[] = UMDZIDZISI_RAIL_CONFIG;
  // Logout pinned to the bottom of the rail; wire its action to logout().
  protected readonly railFooterConfig: TreeNavNode[] =
    UMDZIDZISI_RAIL_FOOTER_CONFIG.map((item) => ({
      ...item,
      action:
        item.id === 'rail-logout' ? (): void => this.logout() : item.action,
    }));
  // Tree is text-only; icons live in the rail (matches designs/img_3.png).
  protected readonly navConfig2: TreeNavConfig = {
    showIcons: false,
    showBadges: true,
    collapsible: true,
  };
  protected readonly navConfig: TreeNavNode[] = [
    ...UMDZIDZISI_ADMIN_NAV_CONFIG,
    ...USER_MENU_CONFIG.map((item) => ({
      ...item,
      action: item.id === 'logout' ? (): void => this.logout() : item.action,
    })),
  ];

  private logout(): void {
    // Handle logout
    this.router.navigate(['/login']);
  }
}
