import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {}
