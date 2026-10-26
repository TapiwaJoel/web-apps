import {
  ChangeDetectionStrategy,
  Component,
  input,
  type InputSignal,
} from '@angular/core';
import { KpiCard } from './kpi-card.type';

@Component({
  selector: 'org-kpi-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-stat-card.component.html',
})
export class KpiStatCardComponent {
  public readonly card: InputSignal<KpiCard> = input.required<KpiCard>();
}
