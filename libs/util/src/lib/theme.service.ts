import {
  Injectable,
  signal,
  computed,
  inject,
  InjectionToken,
  Signal,
} from '@angular/core';
import { THEMES } from './themes/theme-config';
import { Theme } from './models/theme.model';

// Injection token for environment configuration
export const ENVIRONMENT: InjectionToken<{ defaultTheme?: string }> =
  new InjectionToken<{ defaultTheme?: string }>('environment');

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private environment: { defaultTheme?: string } | null = inject(ENVIRONMENT, {
    optional: true,
  });
  private currentThemeSignal: ReturnType<typeof signal<string>> =
    signal<string>('default');
  public currentTheme: Signal<string> = this.currentThemeSignal.asReadonly();

  // Computed signal that returns the full Theme object
  public currentThemeConfig: ReturnType<typeof computed<Theme>> =
    computed<Theme>(() => {
      const themeName: string = this.currentThemeSignal();
      return THEMES[themeName] || THEMES['default'];
    });

  public constructor() {
    // Initialize with environment-specific theme
    const defaultTheme: string = this.environment?.defaultTheme || 'default';
    this.setTheme(defaultTheme);
  }

  /**
   * Sets the current theme by applying the data-theme attribute to the document element
   * @param themeName - The name of the theme to apply (must exist in THEMES configuration)
   */
  public setTheme(themeName: string): void {
    if (!THEMES[themeName]) {
      console.warn(
        `Theme "${themeName}" not found. Falling back to default theme.`,
      );
      themeName = 'default';
    }

    document.documentElement.setAttribute('data-theme', themeName);
    this.currentThemeSignal.set(themeName);
  }

  /**
   * Maps route paths to themes and applies the appropriate theme
   * This allows automatic theme switching based on the current route
   * @param route - The current route path
   */
  public setThemeFromRoute(route: string): void {
    // Extract the first segment of the route (e.g., '/umdzidzisi-admin/dashboard' -> '/umdzidzisi-admin')
    const baseRoute: string = '/' + route.split('/').filter(Boolean)[0];

    // Try to determine theme from route
    let themeName: string | null = null;
    if (baseRoute.startsWith('/umdzidzisi')) {
      themeName = 'umdzidzisi';
    } else if (baseRoute.startsWith('/umtengesi')) {
      themeName = 'umtengesi';
    }

    // If route doesn't indicate a specific theme, keep the current environment theme
    // This allows routes like /login, /dashboard, etc. to inherit the environment theme
    if (themeName === null) {
      return; // Don't change the theme!
    }

    this.setTheme(themeName);
  }

  /**
   * Gets the current active theme name
   * @returns The name of the currently active theme
   */
  public getCurrentTheme(): string {
    return this.currentThemeSignal();
  }

  /**
   * Gets the theme configuration object for a given theme name
   * @param themeName - The name of the theme
   * @returns The Theme configuration object or undefined if not found
   */
  public getThemeConfig(themeName: string): Theme | undefined {
    return THEMES[themeName];
  }

  /**
   * Gets all available themes
   * @returns Record of all theme configurations
   */
  public getAllThemes(): Record<string, Theme> {
    return THEMES;
  }
}
