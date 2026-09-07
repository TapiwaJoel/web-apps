import { Component, computed, inject, Signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarLayoutComponent, TreeNavNode } from '@mushaviri/ui';
import { AuthenticationService } from '@mushaviri/api';
import { SessionStore } from '@mushaviri/util';
import {
  INSURANCE_ADMIN_NAV_CONFIG,
  USER_MENU_CONFIG,
} from '../config/navigation.config';
import { DashboardTopbarComponent } from './topbar/dashboard-topbar.component';

@Component({
  selector: 'org-dashboard-layout',
  standalone: true,
  imports: [SidebarLayoutComponent, RouterOutlet, DashboardTopbarComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly router: Router = inject(Router);
  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private readonly session: SessionStore = inject(SessionStore);

  public navConfig: TreeNavNode[] = [
    ...INSURANCE_ADMIN_NAV_CONFIG,
    ...USER_MENU_CONFIG.map((item) => ({
      ...item,
      action: item.id === 'logout' ? () => this.logout() : item.action,
    })),
  ];

  protected readonly currentUserName: Signal<string> = computed(
    () => this.session.user()?.name ?? 'Admin',
  );
  protected readonly currentUserEmail: Signal<string> = computed(
    () => this.session.user()?.emailAddress ?? '',
  );
  protected readonly currentUserRole: Signal<string> = computed(
    () => this.session.user()?.role ?? '',
  );

  public logout(): void {
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
