import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { KpiSummary } from '../dashboard.types';

@Component({
  selector: 'org-kpi-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './kpi-hero.component.html',
})
export class KpiHeroComponent {
  public readonly kpi: InputSignal<KpiSummary> = input.required<KpiSummary>();

  protected readonly up: Signal<boolean> = computed<boolean>(
    () => this.kpi().delta.pct >= 0,
  );

  protected readonly absPct: Signal<number> = computed<number>(() =>
    Math.abs(this.kpi().delta.pct),
  );
}
