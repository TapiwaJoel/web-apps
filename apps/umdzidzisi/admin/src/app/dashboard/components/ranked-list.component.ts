import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SubjectRank } from '../dashboard.types';

@Component({
  selector: 'org-ranked-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './ranked-list.component.html',
})
export class RankedListComponent {
  public readonly title: InputSignal<string> = input('Top subjects');
  public readonly items: InputSignal<SubjectRank[]> =
    input.required<SubjectRank[]>();
}
