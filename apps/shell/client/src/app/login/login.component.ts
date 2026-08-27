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
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthenticationService,
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

@Component({
  selector: 'org-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Injected services
  private authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private session: SessionStore = inject(SessionStore);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private smartNavigation: SmartNavigationService = inject(
    SmartNavigationService,
  );
  private themeService: ThemeService = inject(ThemeService);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private fb: FormBuilder = inject(FormBuilder);

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
  public readonly errorMessage: WritableSignal<string | null> = signal(null);

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
    this.errorMessage.set(null);

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
          this.errorMessage.set(this.toErrorMessage(error));
        },
      });
  }

  public hasError(control: string, error: string): boolean {
    const field: ReturnType<FormGroup['get']> = this.form.get(control);
    return !!field && field.touched && field.hasError(error);
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
}
