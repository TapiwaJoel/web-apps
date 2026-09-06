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

/**
 * Presentational dialog prompting for the current password before a sensitive
 * action (change password, change email/phone) proceeds. Holds no backend calls
 * itself - `libs/ui` (type:ui) may not depend on `libs/api` (type:feature), so the
 * host component owns the retry call, drives this dialog's `loading` input from the
 * result, and surfaces failures as toasts itself.
 *
 * Triggered when the current session was silently re-established via "remember me"
 * rather than a real password login - the backend's StepUpAuthGuard rejects such
 * sessions on sensitive endpoints with a 403 STEP_UP_REQUIRED, which the host
 * component catches to open this dialog.
 */
@Component({
  selector: 'org-step-up-auth-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './step-up-auth-dialog.component.html',
  styleUrl: './step-up-auth-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepUpAuthDialogComponent {
  /** True while the retry request is in flight; disables the form. */
  public readonly loading: InputSignal<boolean> = input(false);

  /** Emitted with the password the user typed, once submitted. */
  public readonly confirm: OutputEmitterRef<string> = output<string>();
  /** Emitted when the dialog should close (cancel, backdrop, escape). */
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly password: WritableSignal<string> = signal('');

  protected onSubmit(): void {
    const trimmed: string = this.password().trim();
    if (!trimmed || this.loading()) {
      return;
    }
    this.confirm.emit(trimmed);
  }

  protected onCancel(): void {
    if (this.loading()) {
      return;
    }
    this.closed.emit();
  }
}
