import { Injectable, signal, Signal } from '@angular/core';

export interface BannerAction {
  label: string;
  handler: () => void;
}

export interface Banner {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  dismissible: boolean;
  actions?: BannerAction[];
}

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private bannersSignal: ReturnType<typeof signal<Banner[]>> = signal<Banner[]>(
    [],
  );
  public banners: Signal<Banner[]> = this.bannersSignal.asReadonly();

  public show(banner: Omit<Banner, 'id'>): void {
    const id: string = this.generateId();
    const newBanner: Banner = { id, ...banner };

    const currentBanners: Banner[] = this.bannersSignal();
    this.bannersSignal.set([...currentBanners, newBanner]);
  }

  public dismiss(id: string): void {
    this.bannersSignal.update((banners: Banner[]) =>
      banners.filter((banner: Banner) => banner.id !== id),
    );
  }

  public clear(): void {
    this.bannersSignal.set([]);
  }

  private generateId(): string {
    return `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
