import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-claims',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './claims.component.html',
})
export class ClaimsComponent {}
