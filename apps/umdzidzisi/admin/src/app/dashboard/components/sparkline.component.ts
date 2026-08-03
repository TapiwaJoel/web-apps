import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { sparklinePath } from '../chart-geometry';

@Component({
  selector: 'org-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sparkline.component.html',
})
export class SparklineComponent {
  public readonly series: InputSignal<number[]> = input.required<number[]>();
  public readonly tone: InputSignal<'up' | 'down' | 'neutral'> = input<
    'up' | 'down' | 'neutral'
  >('neutral');
  public readonly width: InputSignal<number> = input(96);
  public readonly height: InputSignal<number> = input(28);

  protected readonly d: Signal<string> = computed<string>(() =>
    sparklinePath(this.series(), this.width(), this.height()),
  );

  protected readonly stroke: Signal<string> = computed<string>(() => {
    switch (this.tone()) {
      case 'up':
        return 'var(--color-success, #16a34a)';
      case 'down':
        return 'var(--color-error, #dc2626)';
      default:
        return 'var(--theme-primary-color)';
    }
  });
}
