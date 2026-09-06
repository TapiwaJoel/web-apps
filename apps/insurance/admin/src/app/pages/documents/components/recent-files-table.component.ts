import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  type InputSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { DocumentFile } from '../documents.types';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'org-recent-files-table',
  standalone: true,
  imports: [StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-files-table.component.html',
})
export class RecentFilesTableComponent {
  public readonly files: InputSignal<DocumentFile[]> =
    input.required<DocumentFile[]>();

  protected readonly searchTerm: WritableSignal<string> = signal<string>('');

  protected readonly visibleFiles: Signal<DocumentFile[]> = computed<
    DocumentFile[]
  >(() => {
    const term: string = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.files();
    }
    return this.files().filter(
      (file: DocumentFile): boolean =>
        file.holderName.toLowerCase().includes(term) ||
        file.type.toLowerCase().includes(term) ||
        file.fileId.toLowerCase().includes(term),
    );
  });

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }
}
