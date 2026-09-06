import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationContainerComponent } from '@mushaviri/ui';

@Component({
  imports: [RouterModule, NotificationContainerComponent],
  selector: 'org-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppComponent {
  protected title: string = 'insurance-admin';
}
