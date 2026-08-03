import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SparklineComponent } from './sparkline.component';
import { StatMetric } from '../dashboard.types';

@Component({
  selector: 'org-stat-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SparklineComponent],
  templateUrl: './stat-tile.component.html',
})
export class StatTileComponent {
  public readonly metric: InputSignal<StatMetric> =
    input.required<StatMetric>();

  protected readonly tone: Signal<'up' | 'down' | 'neutral'> = computed<
    'up' | 'down' | 'neutral'
  >(() => {
    const pct: number = this.metric().delta.pct;
    if (pct > 0) return 'up';
    if (pct < 0) return 'down';
    return 'neutral';
  });

  protected readonly absPct: Signal<number> = computed<number>(() =>
    Math.abs(this.metric().delta.pct),
  );
}
