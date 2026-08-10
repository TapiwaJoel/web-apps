import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { ThemeService } from '@mushaviri/util-theming';
import {
  readMode,
  resolveTheme,
  saveMode,
  ThemeMode,
} from './theme-preference';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: string;
}

/**
 * Header theme switcher: a sun/moon button opening a Light / Dark / System
 * popover. The choice persists (localStorage); "System" follows the OS
 * `prefers-color-scheme` and re-applies when the OS setting changes.
 */
@Component({
  selector: 'org-theme-switcher',
  standalone: true,
  imports: [OverlayModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent implements OnDestroy {
  private readonly themeService: ThemeService = inject(ThemeService);

  protected readonly options: ThemeOption[] = [
    { mode: 'light', label: 'Light', icon: 'fi fi-rr-sun' },
    { mode: 'dark', label: 'Dark', icon: 'fi fi-rr-moon' },
    { mode: 'system', label: 'System', icon: 'fi fi-rr-laptop' },
  ];

  protected readonly isOpen: WritableSignal<boolean> = signal(false);
  protected readonly mode: WritableSignal<ThemeMode> = signal(readMode());

  /** True when the currently applied theme is a dark variant (drives the icon). */
  protected readonly isDark: Signal<boolean> = computed(
    () => this.themeService.currentThemeConfig().isDark ?? false,
  );

  private readonly darkQuery: MediaQueryList | null =
    typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly onSystemChange = (): void => {
    if (this.mode() === 'system') {
      this.apply('system');
    }
  };

  constructor() {
    this.darkQuery?.addEventListener('change', this.onSystemChange);
  }

  protected toggle(): void {
    this.isOpen.update((open: boolean) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected isActive(option: ThemeOption): boolean {
    return option.mode === this.mode();
  }

  protected select(option: ThemeOption): void {
    this.mode.set(option.mode);
    saveMode(option.mode);
    this.apply(option.mode);
    this.close();
  }

  private apply(mode: ThemeMode): void {
    this.themeService.setTheme(resolveTheme(mode));
  }

  public ngOnDestroy(): void {
    this.darkQuery?.removeEventListener('change', this.onSystemChange);
  }

  protected trackByMode(_index: number, option: ThemeOption): string {
    return option.mode;
  }
}
