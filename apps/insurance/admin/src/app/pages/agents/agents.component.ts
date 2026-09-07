import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-agents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agents.component.html',
})
export class AgentsComponent {}
