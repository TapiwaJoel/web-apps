import {
  ChangeDetectionStrategy,
  Component,
  input,
  type InputSignal,
} from '@angular/core';

@Component({
  selector: 'org-promo-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './promo-banner.component.html',
})
export class PromoBannerComponent {
  public readonly title: InputSignal<string> = input.required<string>();
  public readonly description: InputSignal<string> = input.required<string>();
  public readonly ctaLabel: InputSignal<string> = input.required<string>();
}
