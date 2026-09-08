import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-settled-claims',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settled-claims.component.html',
})
export class SettledClaimsComponent {}
