import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { barLayout, BarRect } from '../chart-geometry';
import { BAR_SCALE, TimeSeries } from '../dashboard.types';

const CHART_WIDTH: number = 520;
const CHART_HEIGHT: number = 180;

@Component({
  selector: 'org-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bar-chart.component.html',
})
export class BarChartComponent {
  public readonly series: InputSignal<TimeSeries[]> =
    input.required<TimeSeries[]>();

  protected readonly width: number = CHART_WIDTH;
  protected readonly height: number = CHART_HEIGHT;

  protected readonly activeKey: WritableSignal<string> = signal<string>('');

  protected readonly active: Signal<TimeSeries> = computed<TimeSeries>(() => {
    const all: TimeSeries[] = this.series();
    return all.find((s: TimeSeries) => s.key === this.activeKey()) ?? all[0];
  });

  protected readonly bars: Signal<BarRect[]> = computed<BarRect[]>(() =>
    barLayout(this.active().points, CHART_WIDTH, CHART_HEIGHT, 10),
  );

  /**
   * Map a bar to a purple-scale step (lightest → darkest across the series) so
   * the bars read as a real gradient instead of one hue at varying opacity.
   */
  protected barColor(index: number): string {
    const count: number = this.bars().length;
    if (count <= 1) {
      return BAR_SCALE[BAR_SCALE.length - 1];
    }
    const step: number = Math.round(
      (index / (count - 1)) * (BAR_SCALE.length - 1),
    );
    return BAR_SCALE[step];
  }
}
