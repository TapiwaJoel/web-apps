import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AuthMode = 'none' | 'optional' | 'required';

export interface RemoteConfig {
  url: string;
  auth: {
    mode: AuthMode;
  };
}

export type RemoteConfiguration = Record<string, RemoteConfig | string>;

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private remotes: RemoteConfiguration = environment.remotes;

  /**
   * Get the app the shell should land on for the empty route.
   * When set (tenant configs, e.g. umdzidzisi), the shell redirects '' straight
   * into that remote. When unset (default shell config), '' shows the app-selector.
   * @returns The landing remote name, or null to use the app-selector
   */
  public getLandingApp(): string | null {
    return environment.landingApp ?? null;
  }

  /**
   * Get the authentication mode for a specific remote app
   * @param remoteName The name of the remote app (e.g., 'umdzidzisi-website')
   * @returns The auth mode: 'none', 'optional', or 'required'
   */
  public getAuthMode(remoteName: string): AuthMode {
    const config: RemoteConfig | string = this.remotes[remoteName];

    // Handle legacy string format (backward compatibility)
    if (typeof config === 'string') {
      // Default to required for backward compatibility
      return 'required';
    }

    // Return auth mode from config
    return config?.auth?.mode || 'required';
  }

  /**
   * Get the URL for a specific remote app
   * @param remoteName The name of the remote app
   * @returns The remote entry URL
   */
  public getRemoteUrl(remoteName: string): string {
    const config: RemoteConfig | string = this.remotes[remoteName];

    // Handle both string and object formats
    if (typeof config === 'string') {
      return config;
    }

    return config?.url || '';
  }

  /**
   * Get all remote URLs in the format needed for initFederation()
   * @returns Record of remote names to URLs
   */
  public getRemoteUrls(): Record<string, string> {
    const urls: Record<string, string> = {};

    Object.entries(this.remotes).forEach(([name, config]) => {
      urls[name] = typeof config === 'string' ? config : config.url;
    });

    return urls;
  }

  /**
   * Get all configured remote names
   * @returns Array of remote names
   */
  public getAllRemoteNames(): string[] {
    return Object.keys(this.remotes);
  }

  /**
   * Check if a remote exists in the configuration
   * @param remoteName The name of the remote app
   * @returns True if the remote is configured
   */
  public hasRemote(remoteName: string): boolean {
    return remoteName in this.remotes;
  }
}
