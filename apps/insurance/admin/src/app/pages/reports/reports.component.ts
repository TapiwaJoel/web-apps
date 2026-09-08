import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
})
export class ReportsComponent {}
