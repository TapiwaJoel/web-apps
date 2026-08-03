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
      // Mirrors the Tailwind `success`/`error` tokens (tailwind.config.js) so the
      // sparkline stroke matches the delta pill colors. SVG `stroke` can't consume a
      // Tailwind utility class, and these tokens have no CSS-var form in this repo.
      case 'up':
        return '#52c41a';
      case 'down':
        return '#ff4d4f';
      default:
        return 'var(--theme-primary-color)';
    }
  });
}
