import { Injectable, inject, signal, Signal } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { environment } from '../../environments/environment';

export interface FederationManifest {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class RemoteDetectionService {
  private appConfig: AppConfigService = inject(AppConfigService);
  private manifest: FederationManifest = {};
  private availableRemotesSignal: ReturnType<typeof signal<string[]>> = signal<
    string[]
  >([]);
  public availableRemotes: Signal<string[]> =
    this.availableRemotesSignal.asReadonly();
  private checkCache: Map<string, { available: boolean; timestamp: number }> =
    new Map<string, { available: boolean; timestamp: number }>();
  // In dev, a remote briefly 404s while it rebuilds; a long negative cache would
  // keep it "unavailable" for up to half a minute after each change. Use a short
  // window in dev so a rebuilt remote is re-probed almost immediately, and keep
  // the longer window in production where remotes don't churn.
  private readonly CACHE_DURATION: number = environment.production ? 30000 : 2000;
  private readonly REQUEST_TIMEOUT: number = 5000; // 5 seconds

  public constructor() {
    // Use environment-based remote configuration via AppConfigService
    // Development: localhost URLs with ports
    // Production: relative paths for deployment
    this.manifest = this.appConfig.getRemoteUrls();
    // Note: Not checking remotes here - will be checked lazily when needed
  }

  /**
   * Check if a single remote is available
   */
  public async checkRemoteAvailability(remoteName: string): Promise<boolean> {
    // Check cache first
    const cached: { available: boolean; timestamp: number } | undefined =
      this.checkCache.get(remoteName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.available;
    }

    const manifestUrl: string | undefined = this.manifest[remoteName];
    if (!manifestUrl) {
      return false;
    }

    try {
      // Attempt to fetch the remoteEntry.json file
      const response: Response = await fetch(manifestUrl, {
        method: 'HEAD',
        mode: 'cors',
        signal: AbortSignal.timeout(this.REQUEST_TIMEOUT),
      });

      const available: boolean = response.ok;

      // Cache the result
      this.checkCache.set(remoteName, {
        available,
        timestamp: Date.now(),
      });

      return available;
    } catch {
      // If fetch fails, remote is not available
      this.checkCache.set(remoteName, {
        available: false,
        timestamp: Date.now(),
      });
      return false;
    }
  }

  /**
   * Check all remotes and update the available remotes list
   */
  public async checkAllRemotes(): Promise<Map<string, boolean>> {
    const remoteNames: string[] = Object.keys(this.manifest);
    const results: Map<string, boolean> = new Map<string, boolean>();

    const checks: Promise<{ name: string; available: boolean }>[] =
      remoteNames.map(async (name: string) => {
        const available: boolean = await this.checkRemoteAvailability(name);
        results.set(name, available);
        return { name, available };
      });

    await Promise.all(checks);

    // Update the available remotes list
    const availableNames: string[] = Array.from(results.entries())
      .filter(([, available]: [string, boolean]) => available)
      .map(([name]: [string, boolean]) => name);

    this.availableRemotesSignal.set(availableNames);

    return results;
  }

  /**
   * Check remotes sequentially and return the first available one
   * This reduces connection errors by stopping as soon as we find an available remote
   */
  public async checkRemotesSequentially(): Promise<string | null> {
    const remoteNames: string[] = Object.keys(this.manifest);
    const availableRemotes: string[] = [];

    for (const name of remoteNames) {
      const available: boolean = await this.checkRemoteAvailability(name);
      if (available) {
        availableRemotes.push(name);
        // Update the signal with what we found so far
        this.availableRemotesSignal.set(availableRemotes);
        // Return immediately after finding the first available remote
        return name;
      }
    }

    // No remotes available
    this.availableRemotesSignal.set([]);
    return null;
  }

  /**
   * Get available remotes synchronously (from last check)
   */
  public getAvailableRemotesSync(): string[] {
    return this.availableRemotesSignal();
  }

  /**
   * Clear the cache and re-check all remotes
   */
  public async refreshAvailability(): Promise<void> {
    this.checkCache.clear();
    await this.checkAllRemotes();
  }

  /**
   * Get all configured remotes (regardless of availability)
   */
  public getAllConfiguredRemotes(): string[] {
    return Object.keys(this.manifest);
  }
}
