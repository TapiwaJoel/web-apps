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
import { BarRect } from '../../../shared/utils/chart-geometry';
import { PremiumMonth } from '../../../shared/types/dashboard/dashboard.types';
import { AxisTick } from '../../../shared/types/dashboard/components/premium-growth-chart.types';

const CHART_WIDTH: number = 520;
const CHART_HEIGHT: number = 180;
const TOP_PADDING: number = 10;
const BOTTOM_PADDING: number = 10;
const DRAWABLE_HEIGHT: number = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
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

  protected readonly yAxisTicks: Signal<AxisTick[]> = computed<AxisTick[]>(
    () => {
      const max: number = this.yAxisMax();
      return Array.from(
        { length: AXIS_TICK_COUNT },
        (_, i: number): AxisTick => {
          const value: number = max - (max / (AXIS_TICK_COUNT - 1)) * i;
          return {
            value,
            y: CHART_HEIGHT - BOTTOM_PADDING - (value / max) * DRAWABLE_HEIGHT,
          };
        },
      );
    },
  );

  protected readonly bars: Signal<(BarRect & { fill: string })[]> = computed<
    (BarRect & { fill: string })[]
  >(() => {
    const max: number = this.yAxisMax();
    const values: number[] = this.months().map(
      (m: PremiumMonth): number => m.value,
    );
    const gap: number = 12;
    const totalGap: number = gap * (values.length - 1);
    const barWidth: number = (BARS_WIDTH - totalGap) / values.length;
    const activeIdx: number = this.activeIdx();
    return values.map(
      (
        value: number,
        i: number,
      ): BarRect & {
        fill: string;
      } => {
        const h: number = (value / max) * DRAWABLE_HEIGHT;
        return {
          x: AXIS_WIDTH + i * (barWidth + gap),
          y: CHART_HEIGHT - BOTTOM_PADDING - h,
          w: barWidth,
          h,
          fill: i === activeIdx ? ACTIVE_BAR_FILL : INACTIVE_BAR_FILL,
        };
      },
    );
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
}
