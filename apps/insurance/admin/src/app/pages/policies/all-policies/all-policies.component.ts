import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-all-policies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-policies.component.html',
})
export class AllPoliciesComponent {}
