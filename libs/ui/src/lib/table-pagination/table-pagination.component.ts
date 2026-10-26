import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'org-table-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePaginationComponent {
  @Input({ required: true }) public total: number = 0;
  @Input({ required: true }) public page: number = 1;
  @Input({ required: true }) public pageSize: number = 10;
  @Input() public pageSizeOptions: number[] = [10, 25, 50];

  @Output() public pageChange: EventEmitter<number> =
    new EventEmitter<number>();
  @Output() public pageSizeChange: EventEmitter<number> =
    new EventEmitter<number>();

  protected readonly pageCount: Signal<number> = computed<number>(() =>
    Math.max(1, Math.ceil(this.total / this.pageSize)),
  );

  protected readonly rangeStart: Signal<number> = computed<number>(() =>
    this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1,
  );

  protected readonly rangeEnd: Signal<number> = computed<number>(() =>
    Math.min(this.page * this.pageSize, this.total),
  );

  protected readonly pageNumbers: Signal<number[]> = computed<number[]>(() => {
    const count: number = this.pageCount();
    return Array.from(
      { length: count },
      (_, index: number): number => index + 1,
    );
  });

  protected goToPage(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.page) {
      return;
    }
    this.pageChange.emit(page);
  }

  protected onPageSizeChange(size: string): void {
    this.pageSizeChange.emit(Number(size));
  }
}
