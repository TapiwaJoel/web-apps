import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { DocumentStatus } from '../documents.types';

interface BadgeStyle {
  label: string;
  classes: string;
}

const BADGE_STYLES: Record<DocumentStatus, BadgeStyle> = {
  valid: { label: 'Valid', classes: 'bg-success-light text-success' },
  invalid: { label: 'Invalid', classes: 'bg-error-light text-error' },
  expiring: { label: 'Expiring', classes: 'bg-warning-light text-warning' },
};

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
