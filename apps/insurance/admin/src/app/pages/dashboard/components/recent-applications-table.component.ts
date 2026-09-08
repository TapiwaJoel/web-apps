import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { ApplicationRow } from '../../../shared/types/dashboard/dashboard.types';
import { StatusPillComponent } from './status-pill.component';
import {
  APPLICATION_STATUS_STYLES,
  ApplicationDisplayRow,
} from '../../../shared/types/dashboard/components/recent-applications-table.types';

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

  protected readonly displayRows: Signal<ApplicationDisplayRow[]> = computed<
    ApplicationDisplayRow[]
  >(() =>
    this.rows().map((row) => ({
      ...row,
      style: APPLICATION_STATUS_STYLES[row.status],
    })),
  );
}
