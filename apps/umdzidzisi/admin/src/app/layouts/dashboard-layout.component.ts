import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  SidebarLayoutComponent,
  TreeNavConfig,
  TreeNavNode,
} from '@mushaviri/ui-common';
import { DashboardTopbarComponent } from '../dashboard/components/dashboard-topbar.component';
import { ChangePasswordDialogComponent } from '../dashboard/components/change-password-dialog.component';
import {
  UMDZIDZISI_ADMIN_NAV_CONFIG,
  UMDZIDZISI_RAIL_CONFIG,
  UMDZIDZISI_RAIL_FOOTER_CONFIG,
  USER_MENU_CONFIG,
} from '../config/navigation.config';

@Component({
  selector: 'org-dashboard-layout',
  standalone: true,
  imports: [
    SidebarLayoutComponent,
    RouterOutlet,
    DashboardTopbarComponent,
    ChangePasswordDialogComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  private readonly router: Router = inject(Router);

  /** Controls the change-password modal (opened from the profile menu). */
  protected readonly changePasswordOpen: WritableSignal<boolean> =
    signal(false);
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
  // Logout is no longer a nav-tree item — it lives in the header profile menu
  // and the rail footer. Keep the remaining user-menu entries (e.g. Preferences).
  protected readonly navConfig: TreeNavNode[] = [
    ...UMDZIDZISI_ADMIN_NAV_CONFIG,
    ...USER_MENU_CONFIG.filter((item) => item.id !== 'logout'),
  ];

  protected logout(): void {
    // Handle logout
    this.router.navigate(['/login']);
  }
}
