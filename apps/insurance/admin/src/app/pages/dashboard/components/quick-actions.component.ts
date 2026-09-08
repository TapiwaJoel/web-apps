import {
  ChangeDetectionStrategy,
  Component,
  input,
  type InputSignal,
} from '@angular/core';
import { QuickAction } from '../../../shared/types/dashboard/dashboard.types';

@Component({
  selector: 'org-quick-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-actions.component.html',
})
export class QuickActionsComponent {
  public readonly actions: InputSignal<QuickAction[]> =
    input.required<QuickAction[]>();
}
