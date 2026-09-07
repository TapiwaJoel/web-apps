import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'org-client-directory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-directory.component.html',
})
export class ClientDirectoryComponent {}
