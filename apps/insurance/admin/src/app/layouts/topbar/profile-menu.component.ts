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
 * directly; Logout is surfaced to the host via an output.
 */
@Component({
  selector: 'org-profile-menu',
  standalone: true,
  imports: [OverlayModule, RouterModule],
  templateUrl: './profile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  public readonly userName: InputSignal<string> = input('Admin');
  public readonly userEmail: InputSignal<string> = input('');
  public readonly userRole: InputSignal<string> = input('');
  public readonly userPhone: InputSignal<string> = input('');

  /** Emitted when the user chooses Logout. */
  public readonly logout: OutputEmitterRef<void> = output<void>();

  protected readonly isOpen: WritableSignal<boolean> = signal(false);

  /** Initials for the avatar (e.g. "Jane Doe" -> "JD"). */
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

  protected onLogout(): void {
    this.close();
    this.logout.emit();
  }
}
