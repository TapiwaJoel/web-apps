import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  input,
} from '@angular/core';
import { ComplianceSegment, DocumentStatus } from '../documents.types';

const SEGMENT_BAR_CLASSES: Record<DocumentStatus, string> = {
  invalid: 'bg-error',
  expiring: 'bg-warning',
  valid: 'bg-theme-accent',
};

@Component({
  selector: 'org-compliance-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compliance-bar.component.html',
})
export class ComplianceBarComponent {
  public readonly segments: InputSignal<ComplianceSegment[]> =
    input.required<ComplianceSegment[]>();

  protected barClass(tone: DocumentStatus): string {
    return SEGMENT_BAR_CLASSES[tone];
  }
}
