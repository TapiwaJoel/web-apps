import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-preferences',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent {}
