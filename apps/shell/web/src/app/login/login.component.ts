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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApiError,
  AuthenticationService,
  VerificationChannels,
  VerificationsService,
  WebAuthenticationResponseDto,
} from '@mushaviri/api';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SmartNavigationService } from '../services/smart-navigation.service';
import { SessionStore, Theme, ThemeService } from '@mushaviri/util';
import {
  DeviceVerificationChannel,
  DeviceVerificationDialogComponent,
  NotificationService,
} from '@mushaviri/ui';

/** Parsed out of the 403 body when login is blocked pending device verification. */
interface DeviceVerificationChallenge {
  verificationId: string;
  channel: DeviceVerificationChannel;
  availableChannels: DeviceVerificationChannel[];
  otpValidity: number;
}

@Component({
  selector: 'org-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DeviceVerificationDialogComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Injected services
  private authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private verificationsService: VerificationsService =
    inject(VerificationsService);
  private session: SessionStore = inject(SessionStore);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private smartNavigation: SmartNavigationService = inject(
    SmartNavigationService,
  );
  private themeService: ThemeService = inject(ThemeService);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private fb: FormBuilder = inject(FormBuilder);
  private notificationService: NotificationService =
    inject(NotificationService);

  // Public properties
  /**
   * `identifier` is deliberately not email-validated: the backend accepts either an
   * email address or a phone number (+263...) in this field.
   */
  public readonly form: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  public readonly loading: WritableSignal<boolean> = signal(false);

  // Device verification dialog state
  /** Non-null while the "unrecognised device" dialog is open. */
  public readonly deviceChallenge: WritableSignal<DeviceVerificationChallenge | null> =
    signal(null);
  public readonly deviceDialogLoading: WritableSignal<boolean> = signal(false);

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
  public loginText: Signal<string> = computed(() => {
    const theme: Theme = this.currentThemeConfig();
    const displayName: string = (theme.displayName || 'your').toLowerCase();
    const variant: string = theme.appVariant || 'admin';
    return `Sign in to access your ${displayName} ${variant} portal`;
  });

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
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // The backend authenticates on `identifier`, which accepts an email or a phone
    // number. Tokens come back as httpOnly cookies, so there is nothing to store —
    // only the returned session is kept, in signals.
    this.authenticationService
      .login({
        identifier: this.form.value.identifier,
        password: this.form.value.password,
      })
      .subscribe({
        next: async (response: WebAuthenticationResponseDto): Promise<void> => {
          this.session.set(response);
          this.loading.set(false);

          // Check for returnUrl in query parameters
          const returnUrl: string =
            this.route.snapshot.queryParamMap.get('returnUrl') || '';

          if (returnUrl) {
            // Navigate to the intended destination
            await this.router.navigateByUrl(returnUrl);
          } else {
            // Fallback to smart navigation
            await this.smartNavigation.navigateAfterLogin();
          }
        },
        error: (error: unknown): void => {
          this.loading.set(false);
          const challenge: DeviceVerificationChallenge | null =
            this.toDeviceChallenge(error);
          if (challenge) {
            this.deviceChallenge.set(challenge);
            return;
          }
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public hasError(control: string, error: string): boolean {
    const field: ReturnType<FormGroup['get']> = this.form.get(control);
    return !!field && field.touched && field.hasError(error);
  }

  /** User picked a different channel in the dialog: resend the code on it. */
  public onDeviceChannelChange(channel: DeviceVerificationChannel): void {
    const challenge: DeviceVerificationChallenge | null =
      this.deviceChallenge();
    if (!challenge) {
      return;
    }

    this.deviceDialogLoading.set(true);

    this.verificationsService
      .resend({
        verificationId: challenge.verificationId,
        channel: this.toVerificationChannel(channel),
      })
      .subscribe({
        next: (): void => {
          this.deviceDialogLoading.set(false);
          this.deviceChallenge.set({ ...challenge, channel });
        },
        error: (error: unknown): void => {
          this.deviceDialogLoading.set(false);
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  /** User entered the code from their chosen channel: verify, then retry login. */
  public onDeviceCodeSubmit(code: string): void {
    const challenge: DeviceVerificationChallenge | null =
      this.deviceChallenge();
    if (!challenge) {
      return;
    }

    this.deviceDialogLoading.set(true);

    this.verificationsService
      .verify({ verificationId: challenge.verificationId, code })
      .subscribe({
        next: (): void => {
          this.deviceDialogLoading.set(false);
          this.deviceChallenge.set(null);
          // Verification does not issue tokens - the device is now trusted, so the
          // original credentials succeed on a normal retry.
          this.onSubmit();
        },
        error: (error: unknown): void => {
          this.deviceDialogLoading.set(false);
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public onDeviceDialogClosed(): void {
    this.deviceChallenge.set(null);
  }

  // Private methods
  /** `mapHttpError` surfaces the backend's ServiceResponse.message as `ApiError`. */
  private toErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
    return 'Login failed. Please try again.';
  }

  /** Null unless `error` is the "Device verification required" 403 shape. */
  private toDeviceChallenge(
    error: unknown,
  ): DeviceVerificationChallenge | null {
    if (typeof error !== 'object' || error === null) {
      return null;
    }
    const apiError: ApiError = error as ApiError;
    const channel: DeviceVerificationChannel | null = this.toDeviceChannel(
      apiError.channel,
    );
    const availableChannels: DeviceVerificationChannel[] = (
      apiError.availableChannels ?? []
    )
      .map((value: string): DeviceVerificationChannel | null =>
        this.toDeviceChannel(value),
      )
      .filter(
        (
          value: DeviceVerificationChannel | null,
        ): value is DeviceVerificationChannel => value !== null,
      );

    if (
      apiError.statusCode !== 403 ||
      !apiError.verificationId ||
      !channel ||
      availableChannels.length === 0 ||
      typeof apiError.otpValidity !== 'number'
    ) {
      return null;
    }
    return {
      verificationId: apiError.verificationId,
      channel,
      availableChannels,
      otpValidity: apiError.otpValidity,
    };
  }

  /** Validates an untyped channel string from the HTTP error body. */
  private toDeviceChannel(
    value: string | undefined,
  ): DeviceVerificationChannel | null {
    return value === 'EMAIL' || value === 'SMS' ? value : null;
  }

  /** Converts the dialog's channel type back to the backend enum for the API call. */
  private toVerificationChannel(
    channel: DeviceVerificationChannel,
  ): VerificationChannels {
    return channel === 'EMAIL'
      ? VerificationChannels.EMAIL
      : VerificationChannels.SMS;
  }
}
