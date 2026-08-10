import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RemoteDetectionService } from './remote-detection.service';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class SmartNavigationService {
  private router: Router = inject(Router);
  private remoteDetection: RemoteDetectionService = inject(
    RemoteDetectionService,
  );
  private appConfig: AppConfigService = inject(AppConfigService);

  /**
   * Navigate intelligently after login based on available remotes
   */
  public async navigateAfterLogin(): Promise<void> {
    // If a landing app is configured (tenant configs, e.g. umdzidzisi), go
    // straight there instead of auto-detecting the first available remote.
    const landingApp: string | null = this.appConfig.getLandingApp();
    if (landingApp) {
      const navigated: boolean = await this.navigateToRemote(landingApp);
      if (navigated) {
        return;
      }
      // Configured landing app is unavailable - fall back to the app selector.
      await this.router.navigate(['/app-selector'], {
        queryParams: { error: 'no-remotes' },
      });
      return;
    }

    try {
      // Check remotes sequentially and find the first available one
      const firstAvailableRemote: string | null =
        await this.remoteDetection.checkRemotesSequentially();

      if (!firstAvailableRemote) {
        // No remotes available - go to app selector with error message
        console.warn('No remote applications are currently available');
        await this.router.navigate(['/app-selector'], {
          queryParams: { error: 'no-remotes' },
        });
      } else {
        // Navigate to the first available remote's dashboard
        await this.router.navigate([`/${firstAvailableRemote}/dashboard`]);
      }
    } catch (error: unknown) {
      console.error('Error during smart navigation:', error);
      // Fallback to app selector on error
      await this.router.navigate(['/app-selector']);
    }
  }

  /**
   * Navigate to a specific remote if it's available
   */
  public async navigateToRemote(remoteName: string): Promise<boolean> {
    const available: boolean =
      await this.remoteDetection.checkRemoteAvailability(remoteName);

    if (available) {
      await this.router.navigate([`/${remoteName}/dashboard`]);
      return true;
    } else {
      console.warn(`Remote ${remoteName} is not available`);
      return false;
    }
  }
}
