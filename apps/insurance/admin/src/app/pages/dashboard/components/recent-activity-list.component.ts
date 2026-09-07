import {
  ChangeDetectionStrategy,
  Component,
  input,
  type InputSignal,
} from '@angular/core';
import { ActivityItem, ActivityStatus, PillTone } from '../dashboard.types';
import { StatusPillComponent } from './status-pill.component';

interface ActivityStatusStyle {
  tone: PillTone;
  label: string;
}

const ACTIVITY_STATUS_STYLES: Record<ActivityStatus, ActivityStatusStyle> = {
  expiring: { tone: 'warning', label: 'Policy Expiring' },
  approved: { tone: 'success', label: 'Policy Approved' },
  pending: { tone: 'info', label: 'Docs Pending' },
};

const AVATAR_PALETTE: string[] = [
  'bg-insurance-100 text-insurance-700',
  'bg-info-light text-info',
  'bg-success-light text-success',
];

@Component({
  selector: 'org-recent-activity-list',
  standalone: true,
  imports: [StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-activity-list.component.html',
})
export class RecentActivityListComponent {
  public readonly items: InputSignal<ActivityItem[]> =
    input.required<ActivityItem[]>();

  protected statusStyle(status: ActivityStatus): ActivityStatusStyle {
    return ACTIVITY_STATUS_STYLES[status];
  }

  protected avatarClasses(index: number): string {
    return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  }
}
