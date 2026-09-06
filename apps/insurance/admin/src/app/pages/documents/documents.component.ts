import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocumentsPageData, MOCK_DOCUMENTS_DATA } from './documents.types';
import { DocumentCategoryCardComponent } from './components/document-category-card.component';
import { RecentFilesTableComponent } from './components/recent-files-table.component';
import { ComplianceBarComponent } from './components/compliance-bar.component';
import { StorageDonutComponent } from './components/storage-donut.component';

@Component({
  selector: 'org-documents',
  standalone: true,
  imports: [
    DocumentCategoryCardComponent,
    RecentFilesTableComponent,
    ComplianceBarComponent,
    StorageDonutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  protected readonly data: DocumentsPageData = MOCK_DOCUMENTS_DATA;
}
