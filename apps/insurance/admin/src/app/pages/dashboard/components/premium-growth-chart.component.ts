import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  type InputSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { barLayout, BarRect } from '../chart-geometry';
import { PremiumMonth } from '../dashboard.types';

const CHART_WIDTH: number = 520;
const CHART_HEIGHT: number = 180;
const ACTIVE_BAR_FILL: string = '#1e3a5f';
const INACTIVE_BAR_FILL: string = '#d5dee7';

@Component({
  selector: 'org-premium-growth-chart',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './premium-growth-chart.component.html',
})
export class PremiumGrowthChartComponent {
  public readonly months: InputSignal<PremiumMonth[]> =
    input.required<PremiumMonth[]>();
  public readonly growthPct: InputSignal<number> = input.required<number>();
  public readonly initialActiveIndex: InputSignal<number> = input<number>(0);

  protected readonly width: number = CHART_WIDTH;
  protected readonly height: number = CHART_HEIGHT;

  protected readonly hoverOverride: WritableSignal<number | null> = signal<
    number | null
  >(null);

  protected readonly activeIdx: Signal<number> = computed<number>(
    () => this.hoverOverride() ?? this.initialActiveIndex(),
  );

  protected readonly bars: Signal<BarRect[]> = computed<BarRect[]>(() =>
    barLayout(
      this.months().map((m: PremiumMonth): number => m.value),
      CHART_WIDTH,
      CHART_HEIGHT,
      12,
    ),
  );

  protected readonly activeBar: Signal<BarRect> = computed<BarRect>(
    () => this.bars()[this.activeIdx()],
  );

  protected readonly activeMonth: Signal<PremiumMonth> = computed<PremiumMonth>(
    () => this.months()[this.activeIdx()],
  );

  protected readonly tooltipLeftPct: Signal<number> = computed<number>(() => {
    const bar: BarRect = this.activeBar();
    return ((bar.x + bar.w / 2) / CHART_WIDTH) * 100;
  });

  protected onBarHover(index: number): void {
    this.hoverOverride.set(index);
  }

  protected barFill(index: number): string {
    return index === this.activeIdx() ? ACTIVE_BAR_FILL : INACTIVE_BAR_FILL;
  }
}
