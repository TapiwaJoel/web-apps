import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuditTrailResponseDto } from '@mushaviri/api';
import { AuditActionStyle } from '../types/audit-action-style.type';
import {
  AUDIT_ACTION_STYLES,
  DEFAULT_AUDIT_ACTION_STYLE,
} from '../types/audit-action-styles.const';

interface AuditTrailRow extends AuditTrailResponseDto {
  style: AuditActionStyle;
}

@Component({
  selector: 'org-user-audit-trail-list',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-audit-trail-list.component.html',
})
export class UserAuditTrailListComponent {
  public readonly entries: InputSignal<AuditTrailResponseDto[]> =
    input.required<AuditTrailResponseDto[]>();

  protected readonly rows: Signal<AuditTrailRow[]> = computed<AuditTrailRow[]>(
    () =>
      [...this.entries()]
        .sort(
          (a: AuditTrailResponseDto, b: AuditTrailResponseDto): number =>
            new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime(),
        )
        .map((entry: AuditTrailResponseDto): AuditTrailRow => ({
          ...entry,
          style:
            AUDIT_ACTION_STYLES[entry.action] ?? DEFAULT_AUDIT_ACTION_STYLE,
        })),
  );
}
