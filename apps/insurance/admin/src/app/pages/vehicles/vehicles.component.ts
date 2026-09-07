import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-vehicles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicles.component.html',
})
export class VehiclesComponent {}
