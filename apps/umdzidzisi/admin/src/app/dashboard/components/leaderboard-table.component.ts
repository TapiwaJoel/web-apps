import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BoardRow } from '../dashboard.types';

@Component({
  selector: 'org-leaderboard-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './leaderboard-table.component.html',
})
export class LeaderboardTableComponent {
  public readonly rows: InputSignal<BoardRow[]> = input.required<BoardRow[]>();
}
