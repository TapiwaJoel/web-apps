import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-lapsed-policies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lapsed-policies.component.html',
})
export class LapsedPoliciesComponent {}
