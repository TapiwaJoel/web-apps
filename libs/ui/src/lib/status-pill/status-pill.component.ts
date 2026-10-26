import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { StatusTone } from './status-tone.type';

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  info: 'bg-info-light text-info',
  error: 'bg-error-light text-error',
};

@Component({
  selector: 'org-status-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-pill.component.html',
})
export class StatusPillComponent {
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly tone: InputSignal<StatusTone> = input.required<StatusTone>();

  protected readonly classes: Signal<string> = computed<string>(
    () => TONE_CLASSES[this.tone()],
  );
}
