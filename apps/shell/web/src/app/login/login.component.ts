import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@mushaviri/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartNavigationService } from '../services/smart-navigation.service';
import { Theme, ThemeService } from '@mushaviri/util';

@Component({
  selector: 'org-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Injected services
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private smartNavigation: SmartNavigationService = inject(
    SmartNavigationService,
  );
  private themeService: ThemeService = inject(ThemeService);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  // Apply theme colors via CSS custom properties
  public constructor() {
    effect(() => {
      const theme: Theme = this.currentThemeConfig();
      const host: HTMLElement = this.elementRef.nativeElement;
      host.style.setProperty('--primary-color', theme.primaryColor);
      host.style.setProperty('--bg-color', theme.backgroundColor || '#f3f4f6');
    });
  }

  // Public properties
  public username: string = '';
  public password: string = '';

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

  // Methods
  public onSubmit(): void {
    // Simple mock login - in real app, you'd validate credentials
    const credentials: { email: string; password: string } = {
      email: this.username,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: async (): Promise<void> => {
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
      error: (error: unknown) => {
        console.error('Login failed', error);
      },
    });
  }
}
