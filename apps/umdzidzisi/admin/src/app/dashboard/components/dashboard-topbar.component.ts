import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';

@Component({
  selector: 'org-dashboard-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-topbar.component.html',
})
export class DashboardTopbarComponent {
  public readonly userName: InputSignal<string> = input('Admin');

  protected readonly initials: Signal<string> = computed<string>(() =>
    this.userName()
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
}
