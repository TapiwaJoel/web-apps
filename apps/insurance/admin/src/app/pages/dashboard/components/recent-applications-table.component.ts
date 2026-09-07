import {
  ChangeDetectionStrategy,
  Component,
  input,
  type InputSignal,
} from '@angular/core';
import {
  ApplicationRow,
  ApplicationStatus,
  PillTone,
} from '../dashboard.types';
import { StatusPillComponent } from './status-pill.component';

interface ApplicationStatusStyle {
  tone: PillTone;
  label: string;
}

const APPLICATION_STATUS_STYLES: Record<
  ApplicationStatus,
  ApplicationStatusStyle
> = {
  active: { tone: 'success', label: 'Active' },
  pending: { tone: 'warning', label: 'Pending' },
  expiring: { tone: 'warning', label: 'Expiring' },
};

@Component({
  selector: 'org-recent-applications-table',
  standalone: true,
  imports: [StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-applications-table.component.html',
})
export class RecentApplicationsTableComponent {
  public readonly rows: InputSignal<ApplicationRow[]> =
    input.required<ApplicationRow[]>();

  protected statusStyle(status: ApplicationStatus): ApplicationStatusStyle {
    return APPLICATION_STATUS_STYLES[status];
  }
}
