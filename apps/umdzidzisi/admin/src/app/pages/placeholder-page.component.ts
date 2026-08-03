import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'org-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placeholder-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly pageTitle: string =
    this.route.snapshot.data['title'] || 'Page';
  protected readonly currentRoute: string = window.location.pathname;
}
