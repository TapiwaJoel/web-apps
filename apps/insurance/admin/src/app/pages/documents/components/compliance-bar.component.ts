import {
  ChangeDetectionStrategy,
  Component,
  computed,
  InputSignal,
  input,
  Signal,
} from '@angular/core';
import { ComplianceSegment } from '../../../shared/types/documents/documents.types';
import {
  ComplianceSegmentRow,
  SEGMENT_BAR_CLASSES,
} from '../../../shared/types/documents/components/compliance-bar.types';

@Component({
  selector: 'org-compliance-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compliance-bar.component.html',
})
export class ComplianceBarComponent {
  public readonly segments: InputSignal<ComplianceSegment[]> =
    input.required<ComplianceSegment[]>();

  protected readonly rows: Signal<ComplianceSegmentRow[]> = computed<
    ComplianceSegmentRow[]
  >(() =>
    this.segments().map((segment: ComplianceSegment): ComplianceSegmentRow => ({
      ...segment,
      barClass: SEGMENT_BAR_CLASSES[segment.tone],
    })),
  );
}
