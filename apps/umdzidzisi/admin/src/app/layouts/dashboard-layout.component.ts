import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  SidebarLayoutComponent,
  TreeNavConfig,
  TreeNavNode,
} from '@mushaviri/ui';
import { AuthenticationService } from '@mushaviri/api';
import { SessionStore } from '@mushaviri/util';
import { DashboardTopbarComponent } from '../dashboard/components/dashboard-topbar.component';
import { ChangePasswordDialogComponent } from '../dashboard/components/change-password-dialog.component';
import {
  UMDZIDZISI_ADMIN_NAV_CONFIG,
  UMDZIDZISI_RAIL_CONFIG,
  UMDZIDZISI_RAIL_FOOTER_CONFIG,
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
  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private readonly session: SessionStore = inject(SessionStore);

  protected readonly currentUserName: Signal<string> = computed(
    () => this.session.systemUser()?.name ?? 'Admin',
  );
  protected readonly currentUserEmail: Signal<string> = computed(
    () => this.session.systemUser()?.emailAddress ?? '',
  );
  protected readonly currentUserRole: Signal<string> = computed(
    () => this.session.roleName() ?? this.session.systemUser()?.role ?? '',
  );

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
  // Logout is not a nav-tree item — it lives in the header profile menu and
  // the rail footer.
  protected readonly navConfig: TreeNavNode[] = UMDZIDZISI_ADMIN_NAV_CONFIG;

  protected logout(): void {
    this.authenticationService.logout({}).subscribe({
      next: (): void => this.finishLogout(),
      error: (): void => this.finishLogout(),
    });
  }

  /**
   * Runs regardless of whether the server call succeeded - an invalid/expired
   * access token still means the user should end up logged out and at the login
   * screen, not stuck on a failed request.
   */
  private finishLogout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }
}
