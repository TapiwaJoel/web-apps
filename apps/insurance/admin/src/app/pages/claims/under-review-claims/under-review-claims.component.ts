import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-under-review-claims',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './under-review-claims.component.html',
})
export class UnderReviewClaimsComponent {}
