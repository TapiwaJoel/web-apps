import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError, SystemUsersService } from '@mushaviri/api';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Theme, ThemeService } from '@mushaviri/util';
import { NotificationService } from '@mushaviri/ui';

const PASSWORD_PATTERN: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

@Component({
  selector: 'org-activate-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateAccountComponent {
  // Injected services
  private systemUsersService: SystemUsersService = inject(SystemUsersService);
  private notificationService: NotificationService =
    inject(NotificationService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private themeService: ThemeService = inject(ThemeService);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private fb: FormBuilder = inject(FormBuilder);

  // Public properties
  /** Non-null once a `token` query param was found on load. */
  public readonly token: WritableSignal<string | null> = signal(
    this.route.snapshot.queryParamMap.get('token'),
  );
  public readonly activateForm: FormGroup = this.fb.group({
    newPassword: [
      '',
      [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
    ],
    confirmPassword: ['', [Validators.required]],
  });
  public readonly activateLoading: WritableSignal<boolean> = signal(false);
  public readonly showNewPassword: WritableSignal<boolean> = signal(false);
  public readonly showConfirmPassword: WritableSignal<boolean> = signal(false);

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
  public onSubmit(): void {
    const token: string | null = this.token();
    if (!token || this.activateForm.invalid) {
      this.activateForm.markAllAsTouched();
      return;
    }

    const newPassword: string = this.activateForm.value.newPassword;
    if (newPassword !== this.activateForm.value.confirmPassword) {
      this.notificationService.show({
        message: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    this.activateLoading.set(true);

    this.systemUsersService
      .activate({ token, password: newPassword })
      .subscribe({
        next: async (): Promise<void> => {
          this.activateLoading.set(false);
          this.notificationService.show({
            message: 'Account activated successfully. Please sign in.',
            type: 'success',
          });
          await this.router.navigateByUrl('/login');
        },
        error: (error: unknown): void => {
          this.activateLoading.set(false);
          this.notificationService.show({
            message: this.toErrorMessage(error),
            type: 'error',
          });
        },
      });
  }

  public hasError(control: string, error: string): boolean {
    const field: ReturnType<FormGroup['get']> = this.activateForm.get(control);
    return !!field && field.touched && field.hasError(error);
  }

  public toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((value: boolean): boolean => !value);
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value: boolean): boolean => !value);
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
