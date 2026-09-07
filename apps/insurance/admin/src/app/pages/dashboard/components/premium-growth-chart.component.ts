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
import { BarRect } from '../chart-geometry';
import { PremiumMonth } from '../dashboard.types';

const CHART_WIDTH: number = 520;
const CHART_HEIGHT: number = 180;
const AXIS_WIDTH: number = 44;
const BARS_WIDTH: number = CHART_WIDTH - AXIS_WIDTH;
const ACTIVE_BAR_FILL: string = '#1e3a5f';
const INACTIVE_BAR_FILL: string = '#d5dee7';
const AXIS_TICK_COUNT: number = 5;
const AXIS_STEP: number = 25000;

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

  protected readonly yAxisMax: Signal<number> = computed<number>(() => {
    const max: number = Math.max(
      ...this.months().map((m: PremiumMonth): number => m.value),
    );
    return Math.max(Math.ceil(max / AXIS_STEP) * AXIS_STEP, AXIS_STEP);
  });

  protected readonly yAxisTicks: Signal<number[]> = computed<number[]>(() => {
    const max: number = this.yAxisMax();
    return Array.from(
      { length: AXIS_TICK_COUNT },
      (_, i: number): number => max - (max / (AXIS_TICK_COUNT - 1)) * i,
    );
  });

  protected readonly bars: Signal<BarRect[]> = computed<BarRect[]>(() => {
    const max: number = this.yAxisMax();
    const values: number[] = this.months().map(
      (m: PremiumMonth): number => m.value,
    );
    const gap: number = 12;
    const totalGap: number = gap * (values.length - 1);
    const barWidth: number = (BARS_WIDTH - totalGap) / values.length;
    return values.map((value: number, i: number): BarRect => {
      const h: number = (value / max) * CHART_HEIGHT;
      return {
        x: AXIS_WIDTH + i * (barWidth + gap),
        y: CHART_HEIGHT - h,
        w: barWidth,
        h,
      };
    });
  });

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

  protected tickY(tick: number): number {
    return CHART_HEIGHT - (tick / this.yAxisMax()) * CHART_HEIGHT;
  }
}
