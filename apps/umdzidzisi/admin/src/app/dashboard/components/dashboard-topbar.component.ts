import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { GlobalSearchComponent } from './global-search.component';
import { NotificationsMenuComponent } from './notifications-menu.component';
import { ProfileMenuComponent } from './profile-menu.component';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@Component({
  selector: 'org-dashboard-topbar',
  standalone: true,
  imports: [
    GlobalSearchComponent,
    ThemeSwitcherComponent,
    NotificationsMenuComponent,
    ProfileMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-topbar.component.html',
})
export class DashboardTopbarComponent {
  public readonly userName: InputSignal<string> = input('Admin');

  /** Re-emitted from the profile menu so the layout can run the logout flow. */
  public readonly logout: OutputEmitterRef<void> = output<void>();
  /** Re-emitted from the profile menu so the layout can open the modal. */
  public readonly changePassword: OutputEmitterRef<void> = output<void>();
}
