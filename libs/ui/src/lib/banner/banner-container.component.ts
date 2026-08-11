import {
  Component,
  inject,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerService, Banner } from '../services/banner.service';
import { BannerComponent } from './banner.component';

@Component({
  selector: 'org-banner-container',
  standalone: true,
  imports: [CommonModule, BannerComponent],
  templateUrl: './banner-container.component.html',
  styleUrl: './banner-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerContainerComponent {
  private bannerService: BannerService = inject(BannerService);
  public banners: Signal<Banner[]> = this.bannerService.banners;

  public get bannersList(): Banner[] {
    return this.banners();
  }

  public onDismiss(id: string): void {
    this.bannerService.dismiss(id);
  }
}
