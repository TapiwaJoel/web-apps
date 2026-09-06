import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'org-document-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-category-card.component.html',
})
export class DocumentCategoryCardComponent {
  public readonly label: ReturnType<typeof input.required<string>> =
    input.required<string>();
  public readonly icon: ReturnType<typeof input.required<string>> =
    input.required<string>();
  public readonly fileCount: ReturnType<typeof input.required<number>> =
    input.required<number>();
  public readonly sizeLabel: ReturnType<typeof input.required<string>> =
    input.required<string>();
}
