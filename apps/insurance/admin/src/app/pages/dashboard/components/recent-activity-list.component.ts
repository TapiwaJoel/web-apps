import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { ActivityItem } from '../../../shared/types/dashboard/dashboard.types';
import { StatusPillComponent } from './status-pill.component';
import {
  ACTIVITY_STATUS_STYLES,
  type ActivityRow,
} from '../../../shared/types/dashboard/components/recent-activity-list.types';

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

  protected readonly rows: Signal<ActivityRow[]> = computed<ActivityRow[]>(() =>
    this.items().map((item: ActivityItem, index: number): ActivityRow => ({
      ...item,
      style: ACTIVITY_STATUS_STYLES[item.status],
      avatarClass: AVATAR_PALETTE[index % AVATAR_PALETTE.length],
    })),
  );
}
