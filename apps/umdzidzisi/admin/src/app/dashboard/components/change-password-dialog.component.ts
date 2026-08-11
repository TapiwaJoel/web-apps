import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

/**
 * Change-password modal: a centered dialog with a reactive form (current / new /
 * confirm), client-side validation, and a dummy submit that shows an inline
 * success confirmation before closing. No backend — this app has no live auth.
 */
@Component({
  selector: 'org-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordDialogComponent {
  /** Emitted when the dialog should close (cancel, backdrop, escape, or after success). */
  public readonly closed: OutputEmitterRef<void> = output<void>();

  /** True briefly after a valid submit, showing the success confirmation. */
  protected readonly submitted: WritableSignal<boolean> = signal(false);

  /** Per-field show/hide toggles. */
  protected readonly show: WritableSignal<{
    current: boolean;
    next: boolean;
    confirm: boolean;
  }> = signal({ current: false, next: false, confirm: false });

  private readonly fb: FormBuilder = inject(FormBuilder);

  protected readonly form: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [ChangePasswordDialogComponent.passwordsMatch] },
  );

  /** Form-level validator: new and confirm must match. */
  private static passwordsMatch(
    group: AbstractControl,
  ): ValidationErrors | null {
    const next: string = group.get('newPassword')?.value;
    const confirm: string = group.get('confirmPassword')?.value;
    return next && confirm && next !== confirm ? { mismatch: true } : null;
  }

  protected toggleShow(field: 'current' | 'next' | 'confirm'): void {
    this.show.update((s) => ({ ...s, [field]: !s[field] }));
  }

  /** Whether to surface the mismatch error (only once confirm is dirty). */
  protected get showMismatch(): boolean {
    const confirm: AbstractControl | null = this.form.get('confirmPassword');
    return (
      this.form.hasError('mismatch') && !!confirm && (confirm.dirty || confirm.touched)
    );
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Dummy submit: show inline success, then close.
    this.submitted.set(true);
    setTimeout((): void => this.closed.emit(), 1100);
  }

  protected onCancel(): void {
    this.closed.emit();
  }
}
