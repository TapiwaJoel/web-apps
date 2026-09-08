import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-active-policies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './active-policies.component.html',
})
export class ActivePoliciesComponent {}
