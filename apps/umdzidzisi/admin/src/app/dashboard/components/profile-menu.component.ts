import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';

/**
 * Header profile menu: an avatar/name trigger with a CDK connected-overlay panel
 * showing the user's identity and account actions. Navigation items route
 * directly; Change password and Logout are surfaced to the host via outputs.
 */
@Component({
  selector: 'org-profile-menu',
  standalone: true,
  imports: [OverlayModule, RouterModule],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  public readonly userName: InputSignal<string> = input('Admin');
  public readonly email: InputSignal<string> = input('admin@umdzidzisi.co.zw');
  public readonly role: InputSignal<string> = input('Administrator');

  /** Emitted when the user chooses Logout. */
  public readonly logout: OutputEmitterRef<void> = output<void>();
  /** Emitted when the user chooses Change password. */
  public readonly changePassword: OutputEmitterRef<void> = output<void>();

  protected readonly isOpen: WritableSignal<boolean> = signal(false);

  /** Initials for the avatar (e.g. "Umdzidzisi Admin" -> "UA"). */
  protected readonly initials: Signal<string> = computed<string>(() =>
    this.userName()
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  protected toggle(): void {
    this.isOpen.update((open: boolean) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected onChangePassword(): void {
    this.close();
    this.changePassword.emit();
  }

  protected onLogout(): void {
    this.close();
    this.logout.emit();
  }
}
