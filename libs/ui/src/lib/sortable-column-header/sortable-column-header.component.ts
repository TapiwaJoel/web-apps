import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

const NEXT_DIRECTION: Record<
  NonNullable<SortDirection> | 'none',
  SortDirection
> = {
  none: 'asc',
  asc: 'desc',
  desc: null,
};

@Component({
  selector: 'org-sortable-column-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sortable-column-header.component.html',
  styleUrls: ['./sortable-column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableColumnHeaderComponent {
  @Input() public direction: SortDirection = null;
  @Output() public sortChange: EventEmitter<SortDirection> =
    new EventEmitter<SortDirection>();

  protected onClick(): void {
    const key: NonNullable<SortDirection> | 'none' = this.direction ?? 'none';
    this.sortChange.emit(NEXT_DIRECTION[key]);
  }
}
