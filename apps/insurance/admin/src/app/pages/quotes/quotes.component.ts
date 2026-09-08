import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-quotes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes.component.html',
})
export class QuotesComponent {}
