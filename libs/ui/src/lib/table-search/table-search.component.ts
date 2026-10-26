import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const DEBOUNCE_MS: number = 250;

@Component({
  selector: 'org-table-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSearchComponent {
  @Input() public placeholder: string = 'Search…';
  @Output() public searchChange: EventEmitter<string> =
    new EventEmitter<string>();

  protected readonly term: WritableSignal<string> = signal('');
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  protected onInput(value: string): void {
    this.term.set(value);
    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }
    this.debounceHandle = setTimeout((): void => {
      this.searchChange.emit(value);
    }, DEBOUNCE_MS);
  }
}
