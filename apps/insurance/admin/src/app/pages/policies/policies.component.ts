import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-policies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policies.component.html',
})
export class PoliciesComponent {}
