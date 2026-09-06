import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/** A channel the user can choose to receive the verification code on. */
export type DeviceVerificationChannel = 'EMAIL' | 'SMS';

/**
 * Presentational dialog for the "unrecognised device" login flow: lets the user pick
 * a channel (email/SMS), enter the code that was sent, and submit it. Holds no
 * backend calls itself — `libs/ui` (type:ui) may not depend on `libs/api`
 * (type:feature), so the host component owns every `VerificationsService` call,
 * drives this dialog's `loading` input from the result, and surfaces failures as
 * toasts itself.
 */
@Component({
  selector: 'org-device-verification-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './device-verification-dialog.component.html',
  styleUrl: './device-verification-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceVerificationDialogComponent {
  /** Channel the code was (or will be) sent on when the dialog opens. */
  public readonly defaultChannel: InputSignal<DeviceVerificationChannel> =
    input.required<DeviceVerificationChannel>();
  /** Channels the backend allows switching to for this verification. */
  public readonly availableChannels: InputSignal<DeviceVerificationChannel[]> =
    input.required<DeviceVerificationChannel[]>();
  /** Minutes the current code stays valid for, shown to the user. */
  public readonly otpValidity: InputSignal<number> = input.required<number>();
  /** True while a resend/verify request is in flight; disables the form. */
  public readonly loading: InputSignal<boolean> = input(false);

  /** Emitted when the user picks a channel other than the one currently active. */
  public readonly channelChange: OutputEmitterRef<DeviceVerificationChannel> =
    output<DeviceVerificationChannel>();
  /** Emitted with the code the user typed, once the code form is submitted. */
  public readonly codeSubmit: OutputEmitterRef<string> = output<string>();
  /** Emitted when the dialog should close (cancel, backdrop, escape). */
  public readonly closed: OutputEmitterRef<void> = output<void>();

  /** Which channel is currently selected/active for display purposes. */
  protected readonly activeChannel: WritableSignal<DeviceVerificationChannel | null> =
    signal(null);
  protected readonly code: WritableSignal<string> = signal('');

  protected currentChannel(): DeviceVerificationChannel {
    return this.activeChannel() ?? this.defaultChannel();
  }

  protected selectChannel(channel: DeviceVerificationChannel): void {
    if (channel === this.currentChannel() || this.loading()) {
      return;
    }
    this.activeChannel.set(channel);
    this.channelChange.emit(channel);
  }

  protected onSubmit(): void {
    const trimmed: string = this.code().trim();
    if (!trimmed || this.loading()) {
      return;
    }
    this.codeSubmit.emit(trimmed);
  }

  protected onCancel(): void {
    if (this.loading()) {
      return;
    }
    this.closed.emit();
  }
}
