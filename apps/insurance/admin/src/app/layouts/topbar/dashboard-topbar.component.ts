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

@Component({
  selector: 'org-dashboard-topbar',
  standalone: true,
  imports: [
    GlobalSearchComponent,
    NotificationsMenuComponent,
    ProfileMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-topbar.component.html',
})
export class DashboardTopbarComponent {
  public readonly userName: InputSignal<string> = input('Admin');
  public readonly userEmail: InputSignal<string> = input('');
  public readonly userRole: InputSignal<string> = input('');

  /** Re-emitted from the profile menu so the layout can run the logout flow. */
  public readonly logout: OutputEmitterRef<void> = output<void>();
}
