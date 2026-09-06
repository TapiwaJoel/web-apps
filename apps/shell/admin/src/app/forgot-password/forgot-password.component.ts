import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AccountRecoveryResponseDto,
  AccountRecoveryType,
  ApiError,
  AuthenticationService,
  VerificationChannels,
  VerificationsService,
} from '@mushaviri/api';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionStore, Theme, ThemeService } from '@mushaviri/util';
import { NotificationService } from '@mushaviri/ui';

const PASSWORD_PATTERN: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/** Local state populated once the recovery code has been requested. */
interface RecoveryChallenge {
  verificationId: string;
  channel: VerificationChannels;
  expiresInMinutes: number;
}

@Component({
  selector: 'org-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  // Injected services
  private authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private verificationsService: VerificationsService =
    inject(VerificationsService);
  private notificationService: NotificationService =
    inject(NotificationService);
  private session: SessionStore = inject(SessionStore);
  private router: Router = inject(Router);
  private themeService: ThemeService = inject(ThemeService);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private fb: FormBuilder = inject(FormBuilder);

  // Public properties
  public readonly requestForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]],
  });
  public readonly resetForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    newPassword: [
      '',
      [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
    ],
    confirmPassword: ['', [Validators.required]],
  });
  public readonly requestLoading: WritableSignal<boolean> = signal(false);
  public readonly resetLoading: WritableSignal<boolean> = signal(false);

  /** Non-null once a recovery code has been requested; drives step-2 display. */
  public readonly challenge: WritableSignal<RecoveryChallenge | null> =
    signal(null);

  // Computed signals
  public currentThemeConfig: Signal<Theme> = computed(() =>
    this.themeService.currentThemeConfig(),
  );
  public currentIllustration: Signal<string> = computed(
    () =>
      this.currentThemeConfig().loginIllustration ||
      '/assets/illustrations/default-illustration.svg',
  );
  public currentLogo: Signal<string> = computed(
    () => this.currentThemeConfig().logo || '/assets/logos/default-logo.svg',
  );

  // Apply theme colors via CSS custom properties
  public constructor() {
    effect(() => {
      const theme: Theme = this.currentThemeConfig();
      const host: HTMLElement = this.elementRef.nativeElement;
      host.style.setProperty('--primary-color', theme.primaryColor);
      host.style.setProperty('--bg-color', theme.backgroundColor || '#f3f4f6');
    });
  }

  // Public methods
  public onRequestSubmit(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.requestLoading.set(true);

    this.authenticationService
      .accountRecovery({
        identifier: this.requestForm.value.identifier,
        recoveryType: AccountRecoveryType.FORGOT_PASSWORD,
      })
      .subscribe({
        next: (response: AccountRecoveryResponseDto): void => {
          this.requestLoading.set(false);
          // The backend always returns a structurally identical 200 whether or
          // not the account exists (anti-enumeration) - never branch UI
          // behaviour on the response content, only use it to drive step 2.
          this.challenge.set({
            verificationId: response.verificationId,
            channel: response.channel,
            expiresInMinutes: response.expiresInMinutes,
          });
          this.notificationService.show({
            message:
              'If an account exists for that email or phone number, we’ve sent a verification code.',
            type: 'success',
          });
        },
        error: (error: unknown): void => {
          this.requestLoading.set(false);
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public onResetSubmit(): void {
    const challenge: RecoveryChallenge | null = this.challenge();
    if (!challenge || this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const newPassword: string = this.resetForm.value.newPassword;
    if (newPassword !== this.resetForm.value.confirmPassword) {
      this.notificationService.show({
        message: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    this.resetLoading.set(true);

    this.verificationsService
      .verify({
        verificationId: challenge.verificationId,
        code: this.resetForm.value.code,
        newPassword,
      })
      .subscribe({
        next: async (): Promise<void> => {
          this.resetLoading.set(false);
          // Password reset invalidates every existing session server-side and
          // issues no tokens - the user must sign in again with the new password.
          this.session.clear();
          this.notificationService.show({
            message: 'Password reset successfully. Please sign in.',
            type: 'success',
          });
          await this.router.navigateByUrl('/login');
        },
        error: (error: unknown): void => {
          this.resetLoading.set(false);
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public onBackToRequest(): void {
    this.challenge.set(null);
    this.resetForm.reset();
  }

  public onResendCode(): void {
    const challenge: RecoveryChallenge | null = this.challenge();
    if (!challenge) {
      return;
    }

    this.verificationsService
      .resend({ verificationId: challenge.verificationId })
      .subscribe({
        next: (): void => {
          this.notificationService.show({
            message: 'A new code has been sent.',
            type: 'success',
          });
        },
        error: (error: unknown): void => {
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public hasError(form: FormGroup, control: string, error: string): boolean {
    const field: ReturnType<FormGroup['get']> = form.get(control);
    return !!field && field.touched && field.hasError(error);
  }

  public channelLabel(): string {
    return this.challenge()?.channel === VerificationChannels.SMS
      ? 'phone'
      : 'email';
  }

  // Private methods
  /** `mapHttpError` surfaces the backend's ServiceResponse.message as `ApiError`. */
  private toErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as ApiError).message === 'string'
    ) {
      return (error as ApiError).message;
    }
    return 'Something went wrong. Please try again.';
  }
}
