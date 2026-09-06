import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  input,
} from '@angular/core';
import { StorageSlice } from '../documents.types';

@Component({
  selector: 'org-storage-donut',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './storage-donut.component.html',
})
export class StorageDonutComponent {
  public readonly usedPct: Signal<number> = input.required<number>();
  public readonly usedLabel: Signal<string> = input.required<string>();
  public readonly totalLabel: Signal<string> = input.required<string>();
  public readonly slices: Signal<StorageSlice[]> =
    input.required<StorageSlice[]>();

  protected readonly donutGradient: Signal<string> = computed<string>(() => {
    const degrees: number = (this.usedPct() / 100) * 360;
    return `conic-gradient(white ${degrees}deg, rgba(255,255,255,0.25) ${degrees}deg)`;
  });
}
