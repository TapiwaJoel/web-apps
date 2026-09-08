import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-open-claims',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './open-claims.component.html',
})
export class OpenClaimsComponent {}
