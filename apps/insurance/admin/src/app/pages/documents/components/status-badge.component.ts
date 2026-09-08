import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { DocumentStatus } from '../../../shared/types/documents/documents.types';
import {
  BADGE_STYLES,
  BadgeStyle,
} from '../../../shared/types/documents/components/status-badge.types';

@Component({
  selector: 'org-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  public readonly status: InputSignal<DocumentStatus> =
    input.required<DocumentStatus>();

  protected readonly style: Signal<BadgeStyle> = computed<BadgeStyle>(
    () => BADGE_STYLES[this.status()],
  );
}
