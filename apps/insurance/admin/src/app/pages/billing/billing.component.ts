import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-billing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './billing.component.html',
})
export class BillingComponent {}
