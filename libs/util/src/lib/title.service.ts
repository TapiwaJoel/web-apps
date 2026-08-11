import { Injectable, inject, effect } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ThemeService } from './theme.service';
import { Theme } from './models/theme.model';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titleService: Title = inject(Title);
  private themeService: ThemeService = inject(ThemeService);

  public constructor() {
    // Use effect to reactively update the page title when theme changes
    effect(() => {
      const themeConfig: Theme = this.themeService.currentThemeConfig();
      const title: string = this.buildTitle(
        themeConfig.displayName,
        themeConfig.titleSuffix,
      );
      this.titleService.setTitle(title);
    });
  }

  /**
   * Builds the page title from display name and suffix
   * @param displayName - The theme's display name (e.g., 'Umdzidzisi')
   * @param titleSuffix - Optional suffix (e.g., 'Admin Portal')
   * @returns Formatted title string
   */
  private buildTitle(displayName?: string, titleSuffix?: string): string {
    const parts: string[] = [displayName, titleSuffix].filter(
      Boolean,
    ) as string[];
    return parts.length > 0 ? parts.join(' ') : 'Admin Portal';
  }
}
