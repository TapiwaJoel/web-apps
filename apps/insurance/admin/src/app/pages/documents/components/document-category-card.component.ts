import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  input,
} from '@angular/core';

@Component({
  selector: 'org-document-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-category-card.component.html',
})
export class DocumentCategoryCardComponent {
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly icon: InputSignal<string> = input.required<string>();
  public readonly fileCount: InputSignal<number> = input.required<number>();
  public readonly sizeLabel: InputSignal<string> = input.required<string>();
}
